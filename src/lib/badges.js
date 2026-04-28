// Auto-grant de badges (Fase 5).
// Evalúa condiciones por código (`badges.condicion`) y otorga insertando en `badges_usuario`.
// RLS ya permite inserts con auth.uid() = usuario_id.

import { supabase } from './supabase'

// Mapa código → función async que devuelve true si la condición se cumple.
// Cada función recibe { userId, perfil, vertical }.
const EVALUADORES = {
  primera_conversacion_clara: async ({ userId }) => {
    const { count } = await supabase
      .from('conversaciones_clara')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', userId)
    return (count || 0) >= 1
  },
  primera_herramienta: async ({ userId }) => {
    const { count } = await supabase
      .from('resultados_test')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', userId)
      .is('test_id', null)
    return (count || 0) >= 1
  },
  primer_test: async ({ userId }) => {
    const { count } = await supabase
      .from('resultados_test')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', userId)
      .not('test_id', 'is', null)
    return (count || 0) >= 1
  },
  primer_modulo: async ({ userId }) => {
    const { count } = await supabase
      .from('progreso_modulos')
      .select('modulo_id', { count: 'exact', head: true })
      .eq('usuario_id', userId)
    return (count || 0) >= 1
  },
  modulo_completado: async ({ userId }) => {
    const { count } = await supabase
      .from('progreso_modulos')
      .select('modulo_id', { count: 'exact', head: true })
      .eq('usuario_id', userId)
      .eq('completado', true)
    return (count || 0) >= 1
  },
  todos_tests: async ({ userId, vertical = 'mujer' }) => {
    const [{ count: total }, { data: hechos }] = await Promise.all([
      supabase
        .from('tests')
        .select('id', { count: 'exact', head: true })
        .eq('vertical', vertical)
        .eq('activo', true),
      supabase
        .from('resultados_test')
        .select('test_id')
        .eq('usuario_id', userId)
        .not('test_id', 'is', null),
    ])
    if (!total) return false
    const set = new Set((hechos || []).map((r) => r.test_id))
    return set.size >= total
  },
  racha_3: async ({ perfil }) => Math.max(perfil?.racha_dias || 0, perfil?.mejor_racha || 0) >= 3,
  racha_7: async ({ perfil }) => Math.max(perfil?.racha_dias || 0, perfil?.mejor_racha || 0) >= 7,
  racha_30: async ({ perfil }) => Math.max(perfil?.racha_dias || 0, perfil?.mejor_racha || 0) >= 30,
}

// Códigos disparados por cada evento (para chequear sólo lo relevante).
export const EVENTOS_BADGES = {
  chat_enviado:        ['primera_conversacion_clara'],
  herramienta_completada: ['primera_herramienta'],
  test_completado:     ['primer_test', 'todos_tests'],
  modulo_iniciado:     ['primer_modulo'],
  modulo_completado:   ['modulo_completado'],
  ritual_diario:       ['racha_3', 'racha_7', 'racha_30'],
}

// Otorga los badges nuevos cuya condición se cumpla. Evita duplicados consultando primero.
// Devuelve la lista de badges recién otorgados (con titulo, descripcion, icono, puntos, condicion).
export async function evaluarYOtorgarBadges({ userId, perfil, vertical = 'mujer', evento = null }) {
  if (!userId) return []
  const codigosCandidatos = evento && EVENTOS_BADGES[evento]
    ? EVENTOS_BADGES[evento]
    : Object.keys(EVALUADORES)

  const [{ data: catalogo }, { data: ganados }] = await Promise.all([
    supabase.from('badges').select('id, titulo, descripcion, icono, puntos, condicion'),
    supabase.from('badges_usuario').select('badge_id').eq('usuario_id', userId),
  ])
  if (!catalogo) return []
  const ganadosIds = new Set((ganados || []).map((g) => g.badge_id))

  const candidatos = catalogo.filter(
    (b) => !ganadosIds.has(b.id) && codigosCandidatos.includes(b.condicion) && EVALUADORES[b.condicion]
  )

  const otorgados = []
  for (const badge of candidatos) {
    try {
      const cumple = await EVALUADORES[badge.condicion]({ userId, perfil, vertical })
      if (!cumple) continue
      const { error } = await supabase
        .from('badges_usuario')
        .insert({ usuario_id: userId, badge_id: badge.id })
      if (error) {
        console.error('[badges] error insertando', badge.condicion, error.message)
        continue
      }
      otorgados.push(badge)
      try {
        await supabase.rpc('sumar_puntos', {
          p_user_id: userId,
          p_accion: `badge_${badge.condicion}`,
          p_puntos: badge.puntos,
          p_descripcion: `Badge: ${badge.titulo}`,
        })
      } catch (rpcErr) {
        console.error('[badges] error sumando puntos:', rpcErr)
      }
    } catch (e) {
      console.error('[badges] error evaluando', badge.condicion, e)
    }
  }
  return otorgados
}
