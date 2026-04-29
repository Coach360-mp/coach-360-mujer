'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// preferences shape (combinado de user_preferences + perfiles):
// { user_id, nombre, genero, coach_actual, coach_recomendado, areas_interes,
//   tiene_pestana_mujer, tiene_pestana_lideres,
//   plan_actual, nombre_preferido, current_vertical, active_verticals, mensajes_chat_hoy }
export function useUserPreferences() {
  const [userId, setUserId] = useState(null)
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async (uid) => {
    if (!uid) { setLoading(false); return }
    try {
      const res = await fetch(`/api/user/preferences?userId=${uid}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error leyendo preferencias')
      setPreferences(json.data)
      setError(null)
    } catch (err) {
      console.error('[useUserPreferences] error:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelado = false
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelado) return
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      cargar(user.id)
    })
    return () => { cancelado = true }
  }, [cargar])

  // Acepta cualquier subset de campos guardables
  const updatePreferences = useCallback(async (patch) => {
    if (!userId) throw new Error('Usuario no autenticado')
    setLoading(true)
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...patch }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error guardando preferencias')
      // Re-cargar para que se incluyan los joins de perfiles también
      await cargar(userId)
      return json.data
    } catch (err) {
      console.error('[useUserPreferences] update error:', err)
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [userId, cargar])

  const reload = useCallback(() => {
    if (userId) {
      setLoading(true)
      cargar(userId)
    }
  }, [userId, cargar])

  return { preferences, loading, error, updatePreferences, reload, userId }
}
