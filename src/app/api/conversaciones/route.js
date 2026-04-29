export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'

const COACHES_VALIDOS = ['leo', 'clara', 'marco']
const VERTICALES_VALIDAS = ['general', 'mujer', 'lideres']

// GET /api/conversaciones?userId=...&coach=...&vertical=...&activa=...
// Lista conversaciones del usuario con filtros opcionales.
export async function GET(request) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const coach = searchParams.get('coach')
    const vertical = searchParams.get('vertical')
    const activa = searchParams.get('activa')

    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })
    if (coach && !COACHES_VALIDOS.includes(coach)) {
      return NextResponse.json({ error: 'coach inválido' }, { status: 400 })
    }
    if (vertical && !VERTICALES_VALIDAS.includes(vertical)) {
      return NextResponse.json({ error: 'vertical inválido' }, { status: 400 })
    }

    let query = supabaseAdmin
      .from('conversaciones')
      .select('id, coach, vertical, titulo, fecha_inicio, ultimo_mensaje, activa')
      .eq('usuario_id', userId)
      .order('ultimo_mensaje', { ascending: false })

    if (coach) query = query.eq('coach', coach)
    if (vertical) query = query.eq('vertical', vertical)
    if (activa !== null) query = query.eq('activa', activa === 'true')

    const { data, error } = await query
    if (error) {
      console.error('[conversaciones] select error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data: data || [] })
  } catch (err) {
    console.error('[conversaciones] error:', err)
    return NextResponse.json({ error: err?.message || 'Error leyendo conversaciones' }, { status: 500 })
  }
}
