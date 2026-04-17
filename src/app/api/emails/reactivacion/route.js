export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getResend } from '@/lib/clients'
import { getSupabaseAdmin } from '@/lib/clients'



const COACHES = {
  mujer: { nombre: 'Clara', email: 'clara@micoach360.com', color: '#d4af37', colorText: '#1a1a1a' },
  general: { nombre: 'Leo', email: 'leo@micoach360.com', color: '#14b8a6', colorText: '#ffffff' },
  lideres: { nombre: 'Marco', email: 'marco@micoach360.com', color: '#7C3AED', colorText: '#ffffff' },
}

const TEXTOS = {
  dia3: {
    mujer: (nombre) => ({
      asunto: `Clara aquí. Te extraño un poco.`,
      cuerpo: `<p>Han pasado tres días desde que entraste por última vez.</p>
      <p>No te escribo para hacerte sentir culpable. Te escribo porque sé que a veces la vida se pone encima y las cosas que importan quedan para después.</p>
      <p>¿Sabes qué? Después es ahora.</p>
      <p>No tienes que hacer nada grande. Solo entra, dime cómo estás, y seguimos desde donde lo dejamos.</p>`,
      cta: 'Volver a la app →'
    }),
    general: (nombre) => ({
      asunto: `Leo aquí. 3 días sin acción.`,
      cuerpo: `<p>3 días sin entrar.</p>
      <p>Los hábitos se debilitan. El momentum se pierde. Y el cerebro empieza a interpretar "voy a hacerlo" como "probablemente no lo haré".</p>
      <p>Eso no es lo que viniste a buscar.</p>
      <p>Un check-in. Un hábito. Un paso. Hoy.</p>`,
      cta: 'Retomar ahora →'
    }),
    lideres: (nombre) => ({
      asunto: `Marco aquí. ¿Qué te frenó?`,
      cuerpo: `<p>3 días sin entrar.</p>
      <p>No te pregunto esto para hacerte sentir mal. Te pregunto porque un líder que no puede mantener un compromiso consigo mismo tiene dificultades para mantener compromisos con su equipo.</p>
      <p>¿Qué te frenó? Esa respuesta es más importante que el check-in.</p>`,
      cta: 'Retomar →'
    }),
  },
  dia7: {
    mujer: (nombre) => ({
      asunto: `Clara aquí. ¿Sigues eligiéndote?`,
      cuerpo: `<p>Hace una semana que no te veo por aquí.</p>
      <p>No voy a preguntarte por qué — la vida tiene sus razones. Pero sí quiero preguntarte algo más importante:</p>
      <p><strong>¿Sigue siendo tuyo lo que viniste a buscar cuando llegaste?</strong></p>
      <p>Si la respuesta es sí, la puerta sigue abierta. Y yo sigo aquí.</p>`,
      cta: 'Volver →'
    }),
    general: (nombre) => ({
      asunto: `Leo aquí. Una semana sin acción.`,
      cuerpo: `<p>Una semana sin entrar.</p>
      <p>Una pregunta directa: ¿el obstáculo que te frenó antes sigue siendo el mismo?</p>
      <p>Porque si es así, podemos trabajar en eso. Para eso estoy aquí.</p>`,
      cta: 'Retomar →'
    }),
    lideres: (nombre) => ({
      asunto: `Marco aquí. Una semana. Una pregunta.`,
      cuerpo: `<p>Una semana sin entrar.</p>
      <p>Una pregunta directa: ¿el problema que te trajo a Coach 360 Líderes sigue sin resolverse?</p>
      <p>Porque si es así, eso no es una casualidad — es un patrón. Y los patrones en liderazgo no desaparecen solos.</p>
      <p>Cuando estés listo, aquí estoy.</p>`,
      cta: 'Retomar →'
    }),
  },
  dia30: {
    mujer: (nombre) => ({
      asunto: `Clara aquí. Un mes. Algo nuevo te espera.`,
      cuerpo: `<p>Ha pasado un mes.</p>
      <p>En ese tiempo, Coach 360 creció — hay nuevos tests, nuevas herramientas, nuevos módulos. Y yo recuerdo dónde lo dejamos.</p>
      <p>No tienes que empezar de cero. Tienes que continuar eligiéndote.</p>
      <p>¿Volvemos?</p>`,
      cta: 'Ver las novedades →'
    }),
    general: (nombre) => ({
      asunto: `Leo aquí. Un mes. Algo cambió.`,
      cuerpo: `<p>Un mes sin entrar.</p>
      <p>Nuevos tests, nuevas herramientas, nuevo contenido. Y tu objetivo de 90 días sigue ahí, esperando.</p>
      <p>¿Retomamos?</p>`,
      cta: 'Ver novedades →'
    }),
    lideres: (nombre) => ({
      asunto: `Marco aquí. Un mes. Algo cambió en Coach 360.`,
      cuerpo: `<p>Un mes.</p>
      <p>Nuevos diagnósticos, nuevas herramientas ejecutivas, nuevo contenido sobre feedback, delegación y conversaciones difíciles.</p>
      <p>Y yo recuerdo exactamente dónde lo dejamos.</p>
      <p>¿Retomamos?</p>`,
      cta: 'Ver novedades →'
    }),
  },
}

function emailHTML({ nombre, vertical, tipo }) {
  const c = COACHES[vertical] || COACHES.mujer
  const t = TEXTOS[tipo][vertical](nombre)

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background-color:#f9f6f1; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f6f1; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
        <tr>
          <td style="background-color:#1a1a1a; padding: 32px 40px; border-radius: 16px 16px 0 0; text-align:center;">
            <p style="margin:0; color:${c.color}; font-size:13px; letter-spacing:3px; text-transform:uppercase;">COACH 360</p>
            <h1 style="margin:12px 0 0; color:#ffffff; font-size:24px; font-weight:300;">${c.nombre} ✦</h1>
          </td>
        </tr>
        <tr>
          <td style="background-color:#ffffff; padding: 40px; border-left: 1px solid #ede8e0; border-right: 1px solid #ede8e0;">
            <p style="margin:0 0 16px; color:#1a1a1a; font-size:17px; line-height:1.7;">Hola, <strong>${nombre}</strong>.</p>
            <div style="color:#444; font-size:15px; line-height:1.8;">${t.cuerpo}</div>
            <div style="text-align:center; margin:36px 0;">
              <a href="https://micoach360.com" style="background-color:${c.color}; color:${c.colorText}; padding:16px 40px; border-radius:50px; text-decoration:none; font-size:15px; font-weight:600; display:inline-block;">${t.cta}</a>
            </div>
            <p style="color:#888; font-size:14px; margin:0;">${c.nombre} ✦</p>
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

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin()
  const resend = getResend()
  try {
    const { userId, vertical = 'mujer', tipo = 'dia3' } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

    const { data: perfil } = await supabaseAdmin
      .from('perfiles').select('nombre, email').eq('id', userId).single()

    if (!perfil?.email) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const c = COACHES[vertical] || COACHES.mujer
    const nombre = perfil.nombre || 'hola'
    const t = TEXTOS[tipo][vertical](nombre)

    const { data, error } = await resend.emails.send({
      from: `${c.nombre} de Coach 360 <${c.email}>`,
      to: perfil.email,
      subject: t.asunto,
      html: emailHTML({ nombre, vertical, tipo }),
    })

    if (error) return NextResponse.json({ error }, { status: 500 })

    await supabaseAdmin.from('user_context').insert({
      user_id: userId, vertical,
      context_key: `email_${tipo}_enviado`,
      context_value: new Date().toISOString(),
      source_coach: c.nombre.toLowerCase(),
      cross_coach: false,
    })

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
