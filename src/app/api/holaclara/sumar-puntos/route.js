import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { userId, tipo } = await req.json()
    if (!userId || !tipo) return Response.json({ error: 'Faltan parámetros' }, { status: 400 })

    const puntosMap = {
      ritual: 5,
      journaling: 10,
      chat: 5,
      test: 20,
      programa: 50,
      habito: 3,
    }

    const puntos = puntosMap[tipo]
    if (!puntos) return Response.json({ error: 'Tipo inválido' }, { status: 400 })

    await supabase.rpc('sumar_puntos', {
      p_user_id: userId,
      p_puntos: puntos,
      p_tipo: tipo,
    })

    const { data } = await supabase
      .from('puntos_usuaria')
      .select('puntos_totales, nivel')
      .eq('user_id', userId)
      .single()

    return Response.json({ ok: true, puntos_totales: data?.puntos_totales, nivel: data?.nivel })

  } catch (error) {
    console.error('Error sumar puntos:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
