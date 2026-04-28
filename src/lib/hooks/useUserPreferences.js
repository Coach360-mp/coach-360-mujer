'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Devuelve { preferences, loading, error, updatePreferences(nombre, genero), reload() }
// preferences shape: { user_id, nombre, genero, tiene_pestana_mujer, tiene_pestana_lideres, fecha_creado, fecha_actualizado } | null
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

  const updatePreferences = useCallback(async (nombre, genero) => {
    if (!userId) throw new Error('Usuario no autenticado')
    setLoading(true)
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, nombre, genero }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error guardando preferencias')
      setPreferences(json.data)
      setError(null)
      return json.data
    } catch (err) {
      console.error('[useUserPreferences] update error:', err)
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [userId])

  const reload = useCallback(() => {
    if (userId) {
      setLoading(true)
      cargar(userId)
    }
  }, [userId, cargar])

  return { preferences, loading, error, updatePreferences, reload, userId }
}
