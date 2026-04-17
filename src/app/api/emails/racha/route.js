export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'


  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const COACHES = {
  mujer: { nombre: 'Clara', email: 'clara@micoach360.com', color: '#d4af37', colorText: '#1a1a1a' },
  general: { nombre: 'Leo', email: 'leo@micoach360.com', color: '#14b8a6', colorText: '#ffffff' },
  lideres: { nombre: 'Marco', email: 'marco@micoach360.com', color: '#7C3AED', colorText: '#ffffff' },
}

const TEXTOS = {
  mujer: (nombre, racha) => ({
    asunto: `Clara aquí. Tu racha de ${racha} días está en riesgo.`,
    cuerpo: `
      <p>Llevas <strong>${racha} días seguidos</strong>. Eso no fue fácil — fue una decisión que tomaste cada día.</p>
      <p>Mañana podría ser el día ${racha + 1}.</p>
      <p>O podría ser el día en que la racha se rompe y tienes que empezar de cero.</p>
      <p>Tú eliges tu mejor versión — hoy también.</p>
      <p>El check-in toma 10 segundos.</p>
    `,
    cta: 'Hacer mi check-in ahora →'
  }),
  general: (nombre, racha) => ({
    asunto: `Leo aquí. ${racha} días de trabajo en riesgo.`,
    cuerpo: `
      <p><strong>${racha} días seguidos.</strong> Consistencia real.</p>
      <p>Y está a punto de romperse por un día de inacción.</p>
      <p>No dejes que eso pase. Entra, haz el check-in, sigue.</p>
    `,
    cta: 'Salvar mi racha →'
  }),
  lideres: (nombre, racha) => ({
    asunto: `Marco aquí. ${racha} días de práctica ejecutiva en riesgo.`,
    cuerpo: `
      <p><strong>${racha} días de práctica sostenida.</strong></p>
      <p>Los líderes más efectivos tienen una cosa en común: consistencia en sus prácticas personales. No perfección — consistencia.</p>
      <p>No dejes que un día interrumpa lo que construiste.</p>
    `,
    cta: 'Continuar →'
  }),
}

function emailRachaHTML({ nombre, coach, vertical, racha }) {
  const c = COACHES[vertical] || COACHES.mujer
  const t = TEXTOS[vertical](nombre, racha)

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f9f6f1; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f6f1; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <tr>
            <td style="background-color:#1a1a1a; padding: 32px 40px; border-radius: 16px 16px 0 0; text-align:center;">
              <p style="margin:0; color:${c.color}; font-size:13px; letter-spacing:3px; text-transform:uppercase;">COACH 360</p>
              <div style="font-size: 48px; margin: 12px 0;">🔥</div>
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:300;">Tu racha está en riesgo</h1>
              <p style="margin:8px 0 0; color:rgba(255,255,255,0.5); font-size:13px;">${racha} días consecutivos</p>
            </td>
          </tr>

          <tr>
            <td style="background-color:#ffffff; padding: 40px; border-left: 1px solid #ede8e0; border-right: 1px solid #ede8e0;">
              <p style="margin:0 0 16px; color:#1a1a1a; font-size:17px; line-height:1.7;">Hola, <strong>${nombre}</strong>.</p>
              <div style="color:#444; font-size:15px; line-height:1.8;">
                ${t.cuerpo}
              </div>
              <div style="text-align:center; margin:36px 0;">
                <a href="https://micoach360.com" style="background-color:${c.color}; color:${c.colorText}; padding:16px 40px; border-radius:50px; text-decoration:none; font-size:15px; font-weight:600; letter-spacing:0.5px; display:inline-block;">
                  ${t.cta}
                </a>
              </div>
              <p style="color:#888; font-size:14px; line-height:1.7; margin:0;">${c.nombre} ✦</p>
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
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export async function POST(request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabaseAdmin = createClient(
  try {
    const { userId, vertical = 'mujer' } = await request.json()

    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

    const { data: perfil } = await supabaseAdmin
      .from('perfiles')
      .select('nombre, email, racha_dias')
      .eq('id', userId)
      .single()

    if (!perfil?.email) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const c = COACHES[vertical] || COACHES.mujer
    const nombre = perfil.nombre || 'hola'
    const racha = perfil.racha_dias || 0
    const t = TEXTOS[vertical](nombre, racha)

    const { data, error } = await resend.emails.send({
      from: `${c.nombre} de Coach 360 <${c.email}>`,
      to: perfil.email,
      subject: t.asunto,
      html: emailRachaHTML({ nombre, coach: c.nombre, vertical, racha }),
    })

    if (error) {
      console.error('Error enviando email racha:', error)
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
