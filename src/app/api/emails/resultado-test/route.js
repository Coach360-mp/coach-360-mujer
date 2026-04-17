export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'
import { getResend } from '@/lib/clients'

const supabaseAdmin = getSupabaseAdmin()
const resend = getResend()

const coaches = {
  mujer:   { nombre: 'Clara', email: 'clara@micoach360.com', color: '#d4af37', firma: 'Clara ✦\nCoach 360 Mujer' },
  general: { nombre: 'Leo',   email: 'leo@micoach360.com',   color: '#14b8a6', firma: 'Leo\nCoach 360' },
  lideres: { nombre: 'Marco', email: 'marco@micoach360.com', color: '#7C3AED', firma: 'Marco\nCoach 360 Líderes' },
}

export async function POST(request) {
  try {
    const { userId, vertical, testTitulo, perfilResultado } = await request.json()
    if (!userId || !vertical || !perfilResultado) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('nombre, email')
      .eq('id', userId)
      .single()

    if (!perfil?.email) return NextResponse.json({ error: 'Sin email' }, { status: 404 })

    const c = coaches[vertical] || coaches.mujer
    const nombre = perfil.nombre || 'aquí'

    const asuntos = {
      mujer:   `Clara aquí. Tu resultado me dice algo interesante ✦`,
      general: `Leo aquí. Tu resultado abre una conversación.`,
      lideres: `Marco aquí. Tu diagnóstico está listo.`,
    }

    const cuerpos = {
      mujer: `
        <p>Hola, ${nombre}.</p>
        <p>Acabas de completar <strong>${testTitulo}</strong> — y tu resultado es <strong>${perfilResultado}</strong>.</p>
        <p>No es un diagnóstico. No es una caja. Es un punto de partida — un espejo que te muestra desde dónde observas, decides y te relacionas.</p>
        <p>Lo que hagas con eso es lo interesante.</p>
        <p>¿Quieres hablarlo conmigo? Abre la app y escríbeme. Tengo algunas preguntas que podrían sorprenderte.</p>
      `,
      general: `
        <p>Hola, ${nombre}.</p>
        <p>Completaste <strong>${testTitulo}</strong>. Tu resultado: <strong>${perfilResultado}</strong>.</p>
        <p>Un diagnóstico vale lo que hagas con él. La pregunta no es si el resultado es correcto — es qué vas a cambiar esta semana a partir de esto.</p>
        <p>Entra a la app. Hablemos.</p>
      `,
      lideres: `
        <p>Hola, ${nombre}.</p>
        <p>Completaste <strong>${testTitulo}</strong>. Tu perfil: <strong>${perfilResultado}</strong>.</p>
        <p>Los datos son el punto de partida. Lo que importa es lo que decides hacer con ellos desde hoy.</p>
        <p>Tengo preguntas concretas sobre tu resultado. Entra a la app cuando puedas.</p>
      `,
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Georgia, serif; background: #fafaf8; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; border: 1px solid #f0e8d8;">
          <div style="font-size: 11px; letter-spacing: 3px; color: ${c.color}; text-transform: uppercase; font-weight: 600; margin-bottom: 24px;">
            Coach 360
          </div>
          ${cuerpos[vertical] || cuerpos.mujer}
          <div style="margin: 32px 0;">
            <a href="https://micoach360.com" style="background: ${c.color}; color: #0a0a0a; padding: 14px 28px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 14px; font-family: system-ui, sans-serif;">
              Abrir la app →
            </a>
          </div>
          <div style="border-top: 1px solid #f0e8d8; padding-top: 24px; margin-top: 32px; font-size: 13px; color: #888; line-height: 1.6;">
            <p style="margin: 0; white-space: pre-line;">${c.firma}</p>
            <p style="margin: 8px 0 0; font-size: 12px;">—<br>María Paz Reveco, fundadora de Coach 360<br>"Elige tu mejor versión, cada día."<br>micoach360.com</p>
          </div>
        </div>
      </body>
      </html>
    `

    await resend.emails.send({
      from: `${c.nombre} <${c.email}>`,
      to: perfil.email,
      subject: asuntos[vertical] || asuntos.mujer,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error email resultado-test:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
