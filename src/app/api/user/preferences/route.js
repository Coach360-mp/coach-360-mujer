export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'

const GENEROS_VALIDOS = ['mujer', 'hombre', 'prefiero_no_responder']
const COACHES_VALIDOS = ['leo', 'clara', 'marco']

// POST /api/user/preferences
// body: { userId, nombre?, genero?, coach_actual?, coach_recomendado?,
//         coach_elegido_inicial?, acepto_recomendacion?, areas_interes? }
export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const body = await request.json()
    const { userId } = body
    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

    const update = { user_id: userId, fecha_actualizado: new Date().toISOString() }

    if (body.nombre !== undefined) {
      if (!body.nombre.trim()) return NextResponse.json({ error: 'nombre vacío' }, { status: 400 })
      update.nombre = body.nombre.trim()
    }
    if (body.genero !== undefined) {
      if (!GENEROS_VALIDOS.includes(body.genero)) {
        return NextResponse.json({ error: 'genero inválido' }, { status: 400 })
      }
      update.genero = body.genero
    }
    if (body.coach_actual !== undefined) {
      if (!COACHES_VALIDOS.includes(body.coach_actual)) {
        return NextResponse.json({ error: 'coach_actual inválido' }, { status: 400 })
      }
      update.coach_actual = body.coach_actual
    }
    if (body.coach_recomendado !== undefined)     update.coach_recomendado = body.coach_recomendado
    if (body.coach_elegido_inicial !== undefined) update.coach_elegido_inicial = body.coach_elegido_inicial
    if (body.acepto_recomendacion !== undefined)  update.acepto_recomendacion = body.acepto_recomendacion
    if (body.areas_interes !== undefined)         update.areas_interes = body.areas_interes

    // Si es primer insert, nombre es required (NOT NULL en schema)
    if (!body.nombre) {
      const { data: existente } = await supabaseAdmin
        .from('user_preferences').select('user_id').eq('user_id', userId).maybeSingle()
      if (!existente) {
        return NextResponse.json({ error: 'nombre requerido en primer insert' }, { status: 400 })
      }
    }

    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .upsert(update, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('[preferences] upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[preferences] error:', err)
    return NextResponse.json({ error: err?.message || 'Error guardando preferencias' }, { status: 500 })
  }
}

// GET /api/user/preferences?userId=...
// Devuelve combinación de user_preferences + perfiles (plan, nombre_preferido, current_vertical).
export async function GET(request) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

    const [prefRes, perfilRes] = await Promise.all([
      supabaseAdmin.from('user_preferences').select('*').eq('user_id', userId).maybeSingle(),
      supabaseAdmin.from('perfiles')
        .select('plan_actual, nombre, nombre_preferido, current_vertical, active_verticals, mensajes_chat_hoy')
        .eq('id', userId).maybeSingle(),
    ])
    if (prefRes.error) {
      console.error('[preferences] select error:', prefRes.error)
      return NextResponse.json({ error: prefRes.error.message }, { status: 500 })
    }

    const prefs = prefRes.data
    const perfil = perfilRes.data || {}

    const data = prefs ? {
      ...prefs,
      plan_actual: perfil.plan_actual || 'free',
      nombre_preferido: perfil.nombre_preferido || null,
      current_vertical: perfil.current_vertical || null,
      active_verticals: perfil.active_verticals || [],
      mensajes_chat_hoy: perfil.mensajes_chat_hoy || 0,
    } : null

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[preferences] error:', err)
    return NextResponse.json({ error: err?.message || 'Error leyendo preferencias' }, { status: 500 })
  }
}
