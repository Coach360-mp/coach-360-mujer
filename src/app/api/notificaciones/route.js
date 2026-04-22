export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'

const coaches = {
  mujer:   { nombre: 'Clara', color: '#d4af37' },
  general: { nombre: 'Leo',   color: '#14b8a6' },
  lideres: { nombre: 'Marco', color: '#7C3AED' },
}

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { userId, vertical, tipo } = await request.json()

    const { data: tokens } = await supabaseAdmin
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', userId)
      .eq('activo', true)

    if (!tokens?.length) return NextResponse.json({ ok: false, motivo: 'sin tokens' })

    const c = coaches[vertical] || coaches.mujer

    const mensajes = {
      checkin: {
        title: `${c.nombre} te espera ✦`,
        body: 'No olvidaste tu check-in de hoy. ¿Cómo llegaste?',
      },
      racha_riesgo: {
        title: 'Tu racha está en riesgo',
        body: `${c.nombre} quiere saber cómo estás hoy. No pierdas tu racha.`,
      },
      mensaje_coach: {
        title: `${c.nombre} tiene algo para ti`,
        body: 'Entra a la app — hay algo que quiere compartirte.',
      },
    }

    const notif = mensajes[tipo] || mensajes.checkin

    const { data: perfil } = await supabaseAdmin
      .from('perfiles')
      .select('nombre')
      .eq('id', userId)
      .single()

    if (perfil?.nombre) {
      notif.body = notif.body.replace('Entra', `${perfil.nombre}, entra`)
    }

    const accessToken = await getFirebaseAccessToken()

    const resultados = await Promise.all(
      tokens.map(async ({ token }) => {
        const res = await fetch(
          `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: {
                token,
                notification: {
                  title: notif.title,
                  body: notif.body,
                },
                webpush: {
                  notification: {
                    icon: '/icon-192.png',
                    badge: '/icon-192.png',
                    vibrate: [200, 100, 200],
                  },
                  fcm_options: { link: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.micoach360.com'}/dashboard` },
                },
              },
            }),
          }
        )
        if (!res.ok) {
          const err = await res.json()
          if (err?.error?.code === 404) {
            await supabaseAdmin.from('fcm_tokens').update({ activo: false }).eq('token', token)
          }
          return { ok: false, token }
        }
        return { ok: true }
      })
    )

    return NextResponse.json({ ok: true, resultados })
  } catch (err) {
    console.error('Error notificacion:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

async function getFirebaseAccessToken() {
  const { GoogleAuth } = await import('google-auth-library')
  const auth = new GoogleAuth({
    credentials: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  })
  const client = await auth.getClient()
  const token = await client.getAccessToken()
  return token.token
}
