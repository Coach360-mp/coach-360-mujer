export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'

// GET /api/conversaciones/[id]/mensajes?userId=...
// Devuelve los mensajes de una conversación, validando ownership.
export async function GET(request, { params }) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { id: conversacionId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

    const { data: conv, error: convErr } = await supabaseAdmin
      .from('conversaciones')
      .select('usuario_id')
      .eq('id', conversacionId)
      .maybeSingle()
    if (convErr) {
      console.error('[mensajes] conv check error:', convErr)
      return NextResponse.json({ error: convErr.message }, { status: 500 })
    }
    if (!conv || conv.usuario_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin
      .from('mensajes')
      .select('id, rol, contenido, fecha')
      .eq('conversacion_id', conversacionId)
      .order('fecha', { ascending: true })
    if (error) {
      console.error('[mensajes] select error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data: data || [] })
  } catch (err) {
    console.error('[mensajes] error:', err)
    return NextResponse.json({ error: err?.message || 'Error leyendo mensajes' }, { status: 500 })
  }
}
