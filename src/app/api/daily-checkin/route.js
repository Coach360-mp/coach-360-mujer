export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'

// POST /api/daily-checkin
// Body: { userId, acciones: [bool, bool, bool], mood?, energy?, clarity? }
// - INSERT en daily_checkins (idempotente: si ya hay registro de hoy, hace UPDATE de note)
// - Calcula nueva racha en perfiles (ultima_actividad ayer → +1; gap → reset a 1)
// - Suma 5 puntos por ritual_diario en su primera ejecución del día
export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { userId, acciones, mood, energy, clarity, vertical = 'mujer' } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

    const accionesArr = Array.isArray(acciones) ? acciones : [false, false, false]
    const noteJSON = JSON.stringify({ acciones: accionesArr })
    console.log('[ritual] POST recibido:', { userId, vertical, acciones: accionesArr })

    // Verificar si ya hay checkin de hoy (idempotente)
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const { data: existente } = await supabaseAdmin
      .from('daily_checkins')
      .select('id')
      .eq('user_id', userId)
      .eq('vertical', vertical)
      .gte('created_at', startOfToday.toISOString())
      .limit(1)
      .maybeSingle()

    if (existente) {
      console.log('[ritual] checkin ya existe hoy, actualizando note')
      await supabaseAdmin
        .from('daily_checkins')
        .update({ note: noteJSON })
        .eq('id', existente.id)
      const { data: perfil } = await supabaseAdmin
        .from('perfiles')
        .select('racha_dias, mejor_racha')
        .eq('id', userId)
        .single()
      return NextResponse.json({
        success: true,
        racha_dias: perfil?.racha_dias || 0,
        mejor_racha: perfil?.mejor_racha || 0,
        ya_completado: true,
      })
    }

    // INSERT nuevo checkin
    const { error: insertErr } = await supabaseAdmin.from('daily_checkins').insert({
      user_id: userId,
      vertical,
      mood: mood ?? null,
      energy: energy ?? null,
      clarity: clarity ?? null,
      note: noteJSON,
    })
    if (insertErr) {
      console.error('[ritual] error insertando checkin:', insertErr)
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    // Calcular nueva racha
    const { data: perfilActual } = await supabaseAdmin
      .from('perfiles')
      .select('racha_dias, mejor_racha, ultima_actividad')
      .eq('id', userId)
      .single()

    const hoyStr = new Date().toISOString().split('T')[0]
    const ayerStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const ultimaStr = perfilActual?.ultima_actividad
      ? (typeof perfilActual.ultima_actividad === 'string'
          ? perfilActual.ultima_actividad.split('T')[0]
          : new Date(perfilActual.ultima_actividad).toISOString().split('T')[0])
      : null

    let nuevaRacha
    if (ultimaStr === ayerStr) {
      nuevaRacha = (perfilActual?.racha_dias || 0) + 1
    } else if (ultimaStr === hoyStr) {
      nuevaRacha = perfilActual?.racha_dias || 1
    } else {
      nuevaRacha = 1
    }
    const mejorRacha = Math.max(perfilActual?.mejor_racha || 0, nuevaRacha)
    console.log('[ritual] calculo racha:', { ultimaStr, hoyStr, ayerStr, anterior: perfilActual?.racha_dias, nueva: nuevaRacha })

    await supabaseAdmin
      .from('perfiles')
      .update({
        racha_dias: nuevaRacha,
        mejor_racha: mejorRacha,
        ultima_actividad: hoyStr,
      })
      .eq('id', userId)

    // Sumar puntos (no bloquea si falla)
    try {
      await supabaseAdmin.rpc('sumar_puntos', {
        p_user_id: userId,
        p_accion: 'ritual_diario',
        p_puntos: 5,
        p_descripcion: 'Ritual diario completado',
      })
    } catch (err) {
      console.error('[ritual] error sumando puntos:', err)
    }

    return NextResponse.json({
      success: true,
      racha_dias: nuevaRacha,
      mejor_racha: mejorRacha,
      ya_completado: false,
    })
  } catch (err) {
    console.error('[ritual] error no manejado:', err)
    return NextResponse.json({ error: err?.message || 'Error guardando ritual' }, { status: 500 })
  }
}
