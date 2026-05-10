import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const dynamic = 'force-dynamic'

export async function GET(req) {
  // Verificar que viene de Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const hoy = new Date().toISOString().split('T')[0]

    // Buscar planes vencidos que aún no están en free
    const { data: vencidos, error } = await supabase
      .from('perfiles')
      .select('id, nombre, email, plan_actual, fecha_fin_plan')
      .not('plan_actual', 'eq', 'free')
      .not('fecha_fin_plan', 'is', null)
      .lt('fecha_fin_plan', hoy)

    if (error) throw error

    if (!vencidos || vencidos.length === 0) {
      return Response.json({ ok: true, vencidos: 0 })
    }

    // Bajar a free
    const ids = vencidos.map(v => v.id)
    await supabase
      .from('perfiles')
      .update({ plan_actual: 'free' })
      .in('id', ids)

    console.log(`Cron vencimientos: ${vencidos.length} planes bajados a free`)

    return Response.json({ ok: true, vencidos: vencidos.length, ids })

  } catch (error) {
    console.error('Cron vencimientos error:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
