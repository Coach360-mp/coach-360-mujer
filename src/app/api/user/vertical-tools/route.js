export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'

const VERTICALES_VALIDAS = ['coach360', 'mujer', 'lideres']

// POST /api/user/vertical-tools  body: { userId, vertical, tool_id, resultado }
export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { userId, vertical, tool_id, resultado } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    if (!VERTICALES_VALIDAS.includes(vertical)) {
      return NextResponse.json({ error: 'vertical inválido' }, { status: 400 })
    }
    if (!tool_id) return NextResponse.json({ error: 'tool_id requerido' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('user_vertical_tools')
      .upsert({
        user_id: userId,
        vertical,
        tool_id,
        resultado: resultado || {},
        fecha_actualizado: new Date().toISOString(),
      }, { onConflict: 'user_id,vertical,tool_id' })
      .select()
      .single()

    if (error) {
      console.error('[vertical-tools] upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[vertical-tools] error:', err)
    return NextResponse.json({ error: err?.message || 'Error guardando resultado' }, { status: 500 })
  }
}

// GET /api/user/vertical-tools?userId=...&vertical=mujer
export async function GET(request) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const vertical = searchParams.get('vertical')
    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

    let query = supabaseAdmin
      .from('user_vertical_tools')
      .select('*')
      .eq('user_id', userId)
    if (vertical) {
      if (!VERTICALES_VALIDAS.includes(vertical)) {
        return NextResponse.json({ error: 'vertical inválido' }, { status: 400 })
      }
      query = query.eq('vertical', vertical)
    }
    const { data, error } = await query
    if (error) {
      console.error('[vertical-tools] select error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data: data || [] })
  } catch (err) {
    console.error('[vertical-tools] error:', err)
    return NextResponse.json({ error: err?.message || 'Error leyendo resultados' }, { status: 500 })
  }
}
