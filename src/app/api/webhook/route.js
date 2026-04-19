export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin, getResend } from '@/lib/clients'

const COACHES = {
  mujer: { nombre: 'Clara', email: 'clara@micoach360.com', color: '#d4af37' },
  general: { nombre: 'Leo', email: 'leo@micoach360.com', color: '#14b8a6' },
  lideres: { nombre: 'Marco', email: 'marco@micoach360.com', color: '#7C3AED' },
}

function fromDeCoach(vertical) {
  const c = COACHES[vertical] || COACHES.mujer
  return `${c.nombre} de Coach 360 <${c.email}>`
}

function emailSuscripcion({ nombre, planId, vertical }) {
  const esPremium = planId === 'premium'
  const titulo = esPremium ? 'Bienvenida a Premium' : 'Bienvenida a Esencial'
  const incluye = esPremium
    ? `
      <li>Acceso a las 3 verticales: Mujer (Clara), General (Leo) y Líderes (Marco).</li>
      <li>Memoria cruzada entre coaches — una sola historia, tres perspectivas.</li>
      <li>Conversaciones ilimitadas, todos los tests, módulos y herramientas.</li>
      <li>Seguimiento personalizado con neurobiología aplicada.</li>
    `
    : `
      <li>Una vertical completa con tu coach principal.</li>
      <li>Conversaciones ilimitadas por voz y texto.</li>
      <li>Todos los tests de autoconocimiento y herramientas.</li>
      <li>Módulos de crecimiento de 4 semanas cada uno.</li>
    `
  return baseTemplate({
    titulo,
    nombre,
    vertical,
    cuerpo: `
      <p>Gracias por confiar en Coach 360. Acabas de activar tu plan <strong>${esPremium ? 'Premium' : 'Esencial'}</strong> y quiero contarte qué viene ahora.</p>
      <p><strong>Tu plan incluye:</strong></p>
      <ul>${incluye}</ul>
      <p>Entra cuando quieras — tu coach ya sabe que llegaste.</p>
    `,
    cta: 'Abrir la app',
  })
}

function emailSesiones({ nombre, cantidad, tipo, vertical }) {
  const esEjecutiva = tipo === 'ejecutiva'
  const titulo = cantidad === 1
    ? `Confirmación de compra: 1 sesión ${esEjecutiva ? 'ejecutiva' : '1:1'}`
    : `Confirmación de compra: ${cantidad} sesiones ${esEjecutiva ? 'ejecutivas' : '1:1'}`
  return baseTemplate({
    titulo,
    nombre,
    vertical,
    cuerpo: `
      <p>Tu compra quedó confirmada: <strong>${cantidad} ${cantidad === 1 ? 'sesión' : 'sesiones'} de 60 minutos</strong> con ${esEjecutiva ? 'un coach ejecutivo certificado' : 'una coach profesional certificada'}.</p>
      <p><strong>Cómo agendar:</strong></p>
      <ul>
        <li>Entra a la app y abre la sección "Sesiones 1:1".</li>
        <li>Elige el coach que prefieras y un horario disponible.</li>
        <li>Recibirás la confirmación con el link de la videollamada.</li>
      </ul>
      <p>Tus sesiones no caducan. Puedes agendarlas cuando estés lista.</p>
    `,
    cta: 'Agendar mi sesión',
  })
}

function baseTemplate({ titulo, nombre, cuerpo, cta, vertical }) {
  const c = COACHES[vertical] || COACHES.mujer
  const ctaText = vertical === 'mujer' ? '#1a1a1a' : '#ffffff'
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${titulo}</title></head>
<body style="margin:0; padding:0; background-color:#f9f6f1; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f6f1; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
        <tr>
          <td style="background-color:#1a1a1a; padding: 32px 40px; border-radius: 16px 16px 0 0; text-align:center;">
            <p style="margin:0; color:${c.color}; font-size:13px; letter-spacing:3px; text-transform:uppercase;">COACH 360</p>
            <h1 style="margin:8px 0 0; color:#ffffff; font-size:26px; font-weight:300; letter-spacing:1px;">${titulo} ✦</h1>
          </td>
        </tr>
        <tr>
          <td style="background-color:#ffffff; padding: 40px; border-left: 1px solid #ede8e0; border-right: 1px solid #ede8e0;">
            <p style="margin:0 0 16px; color:#1a1a1a; font-size:17px; line-height:1.7;">Hola, <strong>${nombre}</strong>.</p>
            <div style="color:#444; font-size:15px; line-height:1.8;">${cuerpo}</div>
            <div style="text-align:center; margin:36px 0;">
              <a href="https://micoach360.com" style="background-color:${c.color}; color:${ctaText}; padding:16px 40px; border-radius:50px; text-decoration:none; font-size:15px; font-weight:600; letter-spacing:0.5px; display:inline-block;">${cta} →</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f0ebe3; padding: 24px 40px; border-radius: 0 0 16px 16px; border: 1px solid #ede8e0; border-top:none;">
            <p style="margin:0; color:#888; font-size:13px; line-height:1.8;">
              <strong style="color:#444;">María Paz Reveco</strong>, fundadora de Coach 360<br>
              <em style="color:${c.color};">"Elige tu mejor versión, cada día."</em><br>
              <a href="https://micoach360.com" style="color:#888; text-decoration:none;">micoach360.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

async function enviarEmailSeguro({ from, to, subject, html }) {
  try {
    const resend = getResend()
    const { error } = await resend.emails.send({ from, to, subject, html })
    if (error) {
      console.error('[webhook] Error enviando email:', error)
      return false
    }
    console.log('[webhook] Email enviado OK a', to, '—', subject)
    return true
  } catch (err) {
    console.error('[webhook] Excepción enviando email:', err)
    return false
  }
}

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const body = await request.json()
    console.log('[webhook] Recibido:', { type: body.type, data_id: body.data?.id })

    if (body.type !== 'payment' || !body.data?.id) {
      console.log('[webhook] Notificación no-payment o sin data.id, ignorando')
      return NextResponse.json({ received: true })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN_CL || process.env.MERCADOPAGO_ACCESS_TOKEN

    const paymentRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${body.data.id}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    )
    const payment = await paymentRes.json()
    console.log('[webhook] Payment fetch:', { id: body.data.id, status: payment.status, ext_ref: payment.external_reference })

    if (payment.status !== 'approved') {
      console.log('[webhook] Payment no aprobado (status=', payment.status, '), retornando 200')
      return NextResponse.json({ received: true, status: payment.status })
    }

    if (!payment.external_reference) {
      console.log('[webhook] Payment aprobado pero sin external_reference')
      return NextResponse.json({ received: true, error: 'no external_reference' })
    }

    const parts = payment.external_reference.split('_')
    const userId = parts[0]
    const planId = parts[1]
    const vertical = parts[2] || 'mujer'
    console.log('[webhook] Parsed ref:', { userId, planId, vertical })

    if (!userId || !planId) {
      console.log('[webhook] Referencia inválida, faltan userId o planId')
      return NextResponse.json({ received: true, error: 'invalid reference' })
    }

    const { data: perfil } = await supabaseAdmin
      .from('perfiles')
      .select('nombre, nombre_preferido')
      .eq('id', userId)
      .single()

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
    const email = authUser?.user?.email
    const nombreUsuario = perfil?.nombre_preferido || perfil?.nombre || 'Hola'
    console.log('[webhook] Usuario:', { userId, tieneEmail: !!email, nombre: nombreUsuario })

    // === SUSCRIPCIONES ===
    if (planId === 'esencial' || planId === 'premium') {
      console.log('[webhook] Procesando suscripción', planId, 'para', userId)
      const fechaInicio = new Date()
      const fechaFin = new Date()
      fechaFin.setMonth(fechaFin.getMonth() + 1)

      const { data: perfilActual } = await supabaseAdmin
        .from('perfiles')
        .select('active_verticals')
        .eq('id', userId)
        .single()

      let nuevasVerticales = perfilActual?.active_verticals || []
      if (planId === 'premium') {
        nuevasVerticales = Array.from(new Set([...nuevasVerticales, 'mujer', 'general', 'lideres']))
      } else if (!nuevasVerticales.includes(vertical)) {
        nuevasVerticales.push(vertical)
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
      console.log('[webhook] Perfil actualizado con plan', planId, 'verticales:', nuevasVerticales)

      try {
        const puntos = planId === 'premium' ? 100 : 50
        await supabaseAdmin.rpc('sumar_puntos', {
          p_user_id: userId,
          p_accion: 'upgrade_plan',
          p_puntos: puntos,
          p_descripcion: `Upgrade a ${planId}`,
        })
      } catch (err) {
        console.error('[webhook] Error sumando puntos upgrade:', err)
      }

      if (email) {
        await enviarEmailSeguro({
          from: fromDeCoach(vertical),
          to: email,
          subject: planId === 'premium' ? 'Bienvenida a Premium ✦' : 'Bienvenida a Esencial ✦',
          html: emailSuscripcion({ nombre: nombreUsuario, planId, vertical }),
        })
      } else {
        console.log('[webhook] Sin email en auth.users, skip envío suscripción')
      }
    }

    // === SESIONES 1:1 ===
    if (planId.startsWith('sesion_')) {
      let cantidad = 1
      let tipo = 'personal'
      if (planId.includes('_4')) cantidad = 4
      else if (planId.includes('_8')) cantidad = 8
      if (planId.includes('ejecutiva')) tipo = 'ejecutiva'
      console.log('[webhook] Procesando sesiones', { tipo, cantidad, userId })

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
        console.log('[webhook] Sesiones guardadas OK')
      } catch (err) {
        console.error('[webhook] Error guardando sesiones (tabla puede no existir):', err)
      }

      if (email) {
        await enviarEmailSeguro({
          from: fromDeCoach(vertical),
          to: email,
          subject: cantidad === 1
            ? `Confirmación de compra: 1 sesión ${tipo === 'ejecutiva' ? 'ejecutiva' : '1:1'} ✦`
            : `Confirmación de compra: ${cantidad} sesiones ${tipo === 'ejecutiva' ? 'ejecutivas' : '1:1'} ✦`,
          html: emailSesiones({ nombre: nombreUsuario, cantidad, tipo, vertical }),
        })
      } else {
        console.log('[webhook] Sin email en auth.users, skip envío sesiones')
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
