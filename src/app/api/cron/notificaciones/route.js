export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const hoy = new Date().toISOString().split('T')[0]

    // Usuarios sin check-in hoy que tienen token FCM activo
    const { data: tokens } = await supabaseAdmin
      .from('fcm_tokens')
      .select('user_id, token')
      .eq('activo', true)

    if (!tokens?.length) return NextResponse.json({ ok: true, enviados: 0 })

    const userIds = [...new Set(tokens.map(t => t.user_id))]

    // Filtrar los que YA hicieron check-in hoy
    const { data: checkins } = await supabaseAdmin
      .from('daily_checkins')
      .select('user_id')
      .in('user_id', userIds)
      .gte('created_at', `${hoy}T00:00:00`)

    const conCheckin = new Set(checkins?.map(c => c.user_id) || [])
    const sinCheckin = userIds.filter(id => !conCheckin.has(id))

    if (!sinCheckin.length) return NextResponse.json({ ok: true, enviados: 0 })

    // Obtener vertical de cada usuario
    const { data: perfiles } = await supabaseAdmin
      .from('perfiles')
      .select('id, current_vertical')
      .in('id', sinCheckin)

    const verticalMap = {}
    perfiles?.forEach(p => { verticalMap[p.id] = p.current_vertical || 'mujer' })

    let enviados = 0
    for (const userId of sinCheckin) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notificaciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            vertical: verticalMap[userId] || 'mujer',
            tipo: 'checkin',
          }),
        })
        enviados++
      } catch (e) { console.error('Error notif usuario:', userId, e) }
    }

    return NextResponse.json({ ok: true, enviados })
  } catch (err) {
    console.error('Error cron notificaciones:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
