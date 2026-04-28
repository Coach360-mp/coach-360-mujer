export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'

const GENEROS_VALIDOS = ['mujer', 'hombre', 'prefiero_no_responder']

// POST /api/user/preferences  body: { userId, nombre, genero }
export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { userId, nombre, genero } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    if (!nombre || !nombre.trim()) return NextResponse.json({ error: 'nombre requerido' }, { status: 400 })
    if (!GENEROS_VALIDOS.includes(genero)) {
      return NextResponse.json({ error: 'genero inválido' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .upsert({
        user_id: userId,
        nombre: nombre.trim(),
        genero,
        fecha_actualizado: new Date().toISOString(),
      }, { onConflict: 'user_id' })
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
export async function GET(request) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) {
      console.error('[preferences] select error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[preferences] error:', err)
    return NextResponse.json({ error: err?.message || 'Error leyendo preferencias' }, { status: 500 })
  }
}
