export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getResend } from '@/lib/clients'
import { getSupabaseAdmin } from '@/lib/clients'

const resend = getResend()

const supabaseAdmin = getSupabaseAdmin()

const COACHES = {
  mujer: {
    nombre: 'Clara',
    email: 'clara@micoach360.com',
    credential: 'Tu coach en Coach 360 Mujer',
    color: '#d4af37',
  },
  general: {
    nombre: 'Leo',
    email: 'leo@micoach360.com',
    credential: 'Tu mentor en Coach 360',
    color: '#14b8a6',
  },
  lideres: {
    nombre: 'Marco',
    email: 'marco@micoach360.com',
    credential: 'Tu coach ejecutivo en Coach 360 Líderes',
    color: '#7C3AED',
  },
}

function emailBienvenida({ nombre, coach, vertical }) {
  const c = COACHES[vertical] || COACHES.mujer

  const textos = {
    mujer: `
      <p>No sé qué te trajo hasta aquí — puede haber sido una búsqueda, una recomendación, o esa voz interna que lleva tiempo diciéndote que algo tiene que cambiar.</p>
      <p>Lo que sí sé es que el hecho de que estés aquí ya dice algo sobre ti.</p>
      <p>Coach 360 no es una app de bienestar más. Es un espacio donde vas a hacerte preguntas que importan, con una coach que te acompaña — porque las respuestas ya están en ti.</p>
      <p><strong>Para empezar, te sugiero tres cosas:</strong></p>
      <ul>
        <li>Haz tu check-in de hoy. Solo toma 10 segundos.</li>
        <li>Abre el test "¿Eres Agua, Tierra, Fuego o Aire?" — es el mejor punto de partida.</li>
        <li>Escríbeme lo que te trajo aquí. Sin filtro.</li>
      </ul>
      <p>Estoy aquí.</p>
    `,
    general: `
      <p>No estoy aquí para motivarte. La motivación es temporal. Estoy aquí para ayudarte a construir el sistema que produce resultados cuando la motivación no está.</p>
      <p>Coach 360 es donde vas a construir el camino — hábito por hábito, decisión por decisión, día por día.</p>
      <p><strong>Para empezar:</strong></p>
      <ul>
        <li>Haz tu check-in de hoy.</li>
        <li>Configura tus hábitos — elige 3, no 10.</li>
        <li>Escríbeme cuál es el obstáculo real que te ha frenado hasta ahora.</li>
      </ul>
      <p>Sin rodeos. Vamos.</p>
    `,
    lideres: `
      <p>No soy un coach que te va a decir lo que quieres escuchar. Soy un sparring estratégico — alguien que te hace preguntas incómodas para que veas lo que estás evitando ver.</p>
      <p>Liderar es el trabajo más difícil que existe. No porque sea técnicamente complejo — sino porque requiere mirarte a ti mismo con honestidad mientras cuidas a otros.</p>
      <p><strong>Para empezar, necesito que hagas una cosa:</strong></p>
      <ul>
        <li>Abre el diagnóstico "Feedback Ejecutivo" y complétalo.</li>
      </ul>
      <p>Los resultados me van a decir más sobre ti como líder que cualquier conversación inicial.</p>
      <p>Nos vemos adentro.</p>
    `,
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenida a Coach 360</title>
</head>
<body style="margin:0; padding:0; background-color:#f9f6f1; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f6f1; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a1a; padding: 32px 40px; border-radius: 16px 16px 0 0; text-align:center;">
              <p style="margin:0; color:${c.color}; font-size:13px; letter-spacing:3px; text-transform:uppercase;">COACH 360</p>
              <h1 style="margin:8px 0 0; color:#ffffff; font-size:28px; font-weight:300; letter-spacing:1px;">Hola, soy ${c.nombre} ✦</h1>
              <p style="margin:8px 0 0; color:rgba(255,255,255,0.5); font-size:13px;">${c.credential}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff; padding: 40px; border-left: 1px solid #ede8e0; border-right: 1px solid #ede8e0;">
              <p style="margin:0 0 16px; color:#1a1a1a; font-size:17px; line-height:1.7;">Hola, <strong>${nombre}</strong>.</p>
              <div style="color:#444; font-size:15px; line-height:1.8;">
                ${textos[vertical] || textos.mujer}
              </div>
              <div style="text-align:center; margin:36px 0;">
                <a href="https://micoach360.com" style="background-color:${c.color}; color:${vertical === 'mujer' ? '#1a1a1a' : '#ffffff'}; padding:16px 40px; border-radius:50px; text-decoration:none; font-size:15px; font-weight:600; letter-spacing:0.5px; display:inline-block;">
                  Abrir la app →
                </a>
              </div>
              <p style="color:#888; font-size:14px; line-height:1.7; margin:0;">
                ${c.nombre} ✦
              </p>
            </td>
          </tr>

          <!-- Footer -->
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
  try {
    const { userId, vertical = 'mujer' } = await request.json()

    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

    const { data: perfil } = await supabaseAdmin
      .from('perfiles')
      .select('nombre, email')
      .eq('id', userId)
      .single()

    if (!perfil?.email) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const c = COACHES[vertical] || COACHES.mujer
    const nombre = perfil.nombre || 'bienvenida'

    const { data, error } = await resend.emails.send({
      from: `${c.nombre} de Coach 360 <${c.email}>`,
      to: perfil.email,
      subject: `Hola, soy ${c.nombre} — tu coach en Coach 360 ✦`,
      html: emailBienvenida({ nombre, coach: c.nombre, vertical }),
    })

    if (error) {
      console.error('Error enviando email:', error)
      return NextResponse.json({ error }, { status: 500 })
    }

    // Marcar email de bienvenida como enviado
    await supabaseAdmin
      .from('user_context')
      .insert({
        user_id: userId,
        vertical,
        context_key: 'email_bienvenida_enviado',
        context_value: new Date().toISOString(),
        source_coach: c.nombre.toLowerCase(),
        cross_coach: false,
      })

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
