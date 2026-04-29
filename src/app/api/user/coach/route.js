export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'
import { canSelectCoach } from '@/lib/access/getCoachAccess'

const COACHES_VALIDOS = ['leo', 'clara', 'marco']

// POST /api/user/coach  body: { userId, coach_nuevo, motivo? }
// Cambia el coach actual del usuario validando acceso por plan + registra en historial.
export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { userId, coach_nuevo, motivo } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    if (!COACHES_VALIDOS.includes(coach_nuevo)) {
      return NextResponse.json({ error: 'coach inválido' }, { status: 400 })
    }

    const [{ data: prefs }, { data: perfil }] = await Promise.all([
      supabaseAdmin.from('user_preferences').select('coach_actual').eq('user_id', userId).maybeSingle(),
      supabaseAdmin.from('perfiles').select('plan_actual').eq('id', userId).maybeSingle(),
    ])

    const planActual = perfil?.plan_actual || 'free'
    if (!canSelectCoach(coach_nuevo, planActual)) {
      return NextResponse.json({
        error: 'Plan insuficiente para este coach',
        requiere: 'esencial',
      }, { status: 403 })
    }

    const coachAnterior = prefs?.coach_actual || null

    // Histórico (no bloquea si falla)
    try {
      await supabaseAdmin.from('user_coach_history').insert({
        user_id: userId,
        coach_anterior: coachAnterior,
        coach_nuevo,
        motivo_cambio: motivo || null,
      })
    } catch (e) {
      console.error('[coach] history insert error:', e)
    }

    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .upsert({
        user_id: userId,
        coach_actual: coach_nuevo,
        fecha_actualizado: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('[coach] upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[coach] error:', err)
    return NextResponse.json({ error: err?.message || 'Error cambiando coach' }, { status: 500 })
  }
}
