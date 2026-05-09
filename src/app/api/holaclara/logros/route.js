import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { userId } = await req.json()
    if (!userId) return Response.json({ error: 'Falta userId' }, { status: 400 })

    // Verificar logros
    await supabase.rpc('verificar_logros', { p_user_id: userId })

    // Obtener logros actuales
    const { data: logros } = await supabase
      .from('logros_usuario')
      .select('*')
      .eq('user_id', userId)
      .order('desbloqueado_at', { ascending: false })

    // Verificar si es día 7 y enviar carta de Clara
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('created_at, email_carta_dia7_enviado, nombre')
      .eq('id', userId)
      .single()

    if (perfil?.created_at && !perfil?.email_carta_dia7_enviado) {
      const diasDesdeRegistro = Math.floor((Date.now() - new Date(perfil.created_at).getTime()) / (1000 * 60 * 60 * 24))
      if (diasDesdeRegistro >= 7) {
        // Marcar como enviado
        await supabase.from('perfiles').update({ email_carta_dia7_enviado: true }).eq('id', userId)
      }
    }

    return Response.json({ ok: true, logros: logros || [] })
  } catch (error) {
    console.error('Error logros:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
