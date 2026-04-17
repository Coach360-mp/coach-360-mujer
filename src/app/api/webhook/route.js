export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()

    if (body.type === 'payment' && body.data?.id) {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN_CL || process.env.MERCADOPAGO_ACCESS_TOKEN

      // Obtener detalles del pago
      const paymentRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${body.data.id}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      )

      const payment = await paymentRes.json()

      if (payment.status === 'approved' && payment.external_reference) {
        const parts = payment.external_reference.split('_')
        const userId = parts[0]
        const planId = parts[1]
        const vertical = parts[2] || 'mujer'

        if (!userId || !planId) {
          return NextResponse.json({ received: true, error: 'invalid reference' })
        }

        // === SUSCRIPCIONES (esencial, premium) ===
        if (planId === 'esencial' || planId === 'premium') {
          // Calcular fecha de vencimiento: 1 mes
          const fechaInicio = new Date()
          const fechaFin = new Date()
          fechaFin.setMonth(fechaFin.getMonth() + 1)

          // Obtener perfil actual para actualizar active_verticals
          const { data: perfilActual } = await supabaseAdmin
            .from('perfiles')
            .select('active_verticals')
            .eq('id', userId)
            .single()

          let nuevasVerticales = perfilActual?.active_verticals || []

          // Premium da acceso a las 3 verticales
          if (planId === 'premium') {
            const todas = ['mujer', 'general', 'lideres']
            nuevasVerticales = Array.from(new Set([...nuevasVerticales, ...todas]))
          } else if (planId === 'esencial') {
            // Esencial da acceso a la vertical donde compró
            if (!nuevasVerticales.includes(vertical)) {
              nuevasVerticales.push(vertical)
            }
          }

          await supabaseAdmin
            .from('perfiles')
            .update({
              plan_actual: planId,
              fecha_inicio_plan: fechaInicio.toISOString(),
              fecha_fin_plan: fechaFin.toISOString(),
              active_verticals: nuevasVerticales,
            })
            .eq('id', userId)

          // Sumar puntos por upgrade
          try {
            const puntos = planId === 'premium' ? 100 : 50
            await supabaseAdmin.rpc('sumar_puntos', {
              p_user_id: userId,
              p_accion: 'upgrade_plan',
              p_puntos: puntos,
              p_descripcion: `Upgrade a ${planId}`,
            })
          } catch (err) {
            console.error('Error sumando puntos upgrade:', err)
          }
        }

        // === SESIONES HUMANAS (sesion_personal_*, sesion_ejecutiva_*, legacy) ===
        if (planId.startsWith('sesion_')) {
          let cantidad = 1
          let tipo = 'personal'

          if (planId.includes('_4')) cantidad = 4
          else if (planId.includes('_8')) cantidad = 8

          if (planId.includes('ejecutiva')) tipo = 'ejecutiva'

          // Guardar las sesiones compradas
          try {
            await supabaseAdmin.from('sesiones_compradas').insert({
              user_id: userId,
              tipo: tipo,
              cantidad_total: cantidad,
              cantidad_usada: 0,
              payment_id: body.data.id,
              monto: payment.transaction_amount,
              vertical: vertical,
            })
          } catch (err) {
            // Si la tabla no existe aún, al menos dejamos log
            console.error('Error guardando sesiones (tabla puede no existir):', err)
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
