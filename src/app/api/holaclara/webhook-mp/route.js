import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PLAN_MAP = { esencial: 'esencial', profundo: 'profundo' }

export async function POST(req) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (type !== 'payment') return Response.json({ ok: true })

    const paymentId = data?.id
    if (!paymentId) return Response.json({ ok: true })

    const payment = new Payment(mp)
    const pagoMP = await payment.get({ id: paymentId })
    const { status, external_reference, metadata } = pagoMP

    const estadoMap = {
      approved: 'aprobado', pending: 'pendiente',
      in_process: 'pendiente', rejected: 'fallido', cancelled: 'cancelado',
    }
    const estadoNuevo = estadoMap[status] || 'pendiente'

    await supabase.from('pagos_mercadopago')
      .update({ payment_id: String(paymentId), estado: estadoNuevo, webhook_id: String(paymentId), updated_at: new Date().toISOString() })
      .eq('preference_id', pagoMP.preference_id)

    if (estadoNuevo === 'aprobado' && external_reference) {
      const [userId, plan, billing] = external_reference.split('|')
      if (userId && PLAN_MAP[plan]) {
        const hoy = new Date()
        const finPlan = new Date(hoy)
        const billingFinal = billing || metadata?.billing || 'mensual'
        billingFinal === 'anual'
          ? finPlan.setFullYear(finPlan.getFullYear() + 1)
          : finPlan.setMonth(finPlan.getMonth() + 1)

        await supabase.from('perfiles').update({
          plan_actual: PLAN_MAP[plan],
          fecha_inicio_plan: hoy.toISOString().split('T')[0],
          fecha_fin_plan: finPlan.toISOString(),
        }).eq('id', userId)

        const { data: perfil } = await supabase
          .from('perfiles').select('email, nombre').eq('id', userId).single()

        if (perfil?.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://holaclara.app'
          await fetch(`${appUrl}/api/holaclara/email-pago`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: perfil.email,
              nombre: perfil.nombre,
              plan,
              billing: billingFinal,
              paymentId: String(paymentId),
            }),
          })
        }
      }
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Webhook MP error:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ ok: true, service: 'webhook-mp' })
}
