export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const ahora = new Date()
    const hace3 = new Date(ahora); hace3.setDate(hace3.getDate() - 3)
    const hace7 = new Date(ahora); hace7.setDate(hace7.getDate() - 7)
    const hace30 = new Date(ahora); hace30.setDate(hace30.getDate() - 30)

    const hace3Str = hace3.toISOString().split('T')[0]
    const hace7Str = hace7.toISOString().split('T')[0]
    const hace30Str = hace30.toISOString().split('T')[0]

    // Buscar último check-in por usuario
    const { data: checkins } = await supabaseAdmin
      .from('daily_checkins')
      .select('user_id, created_at')
      .order('created_at', { ascending: false })

    // Agrupar último check-in por usuario
    const ultimoCheckin = {}
    checkins?.forEach(c => {
      if (!ultimoCheckin[c.user_id]) {
        ultimoCheckin[c.user_id] = c.created_at.split('T')[0]
      }
    })

    const { data: perfiles } = await supabaseAdmin
      .from('perfiles')
      .select('id, email, nombre, current_vertical')
      .not('email', 'is', null)

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://micoach360.com'
    const enviados = []

    for (const perfil of perfiles || []) {
      const ultimo = ultimoCheckin[perfil.id]
      if (!ultimo) continue

      const vertical = perfil.current_vertical || 'mujer'
      let tipo = null

      if (ultimo === hace3Str) tipo = 'dia3'
      else if (ultimo === hace7Str) tipo = 'dia7'
      else if (ultimo === hace30Str) tipo = 'dia30'

      if (!tipo) continue

      // Verificar que no se haya enviado ya este email
      const { data: yaEnviado } = await supabaseAdmin
        .from('user_context')
        .select('id')
        .eq('user_id', perfil.id)
        .eq('context_key', `email_${tipo}_enviado`)
        .maybeSingle()

      if (yaEnviado) continue

      try {
        const res = await fetch(`${APP_URL}/api/emails/reactivacion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: perfil.id, vertical, tipo })
        })
        if (res.ok) enviados.push({ userId: perfil.id, tipo })
      } catch (e) {
        console.error('Error enviando reactivacion:', e)
      }
    }

    return NextResponse.json({ success: true, enviados: enviados.length, detalle: enviados })
  } catch (error) {
    console.error('Error cron reactivacion:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
