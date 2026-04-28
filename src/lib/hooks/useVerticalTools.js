'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Devuelve { tools, loading, error, saveToolResult(toolId, resultado), getToolResult(toolId), reload() }
// tools: { [tool_id]: resultado }
export function useVerticalTools(vertical = 'coach360') {
  const [userId, setUserId] = useState(null)
  const [tools, setTools] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async (uid) => {
    if (!uid) { setLoading(false); return }
    try {
      const res = await fetch(`/api/user/vertical-tools?userId=${uid}&vertical=${vertical}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error leyendo resultados')
      const map = {}
      ;(json.data || []).forEach(row => { map[row.tool_id] = row.resultado })
      setTools(map)
      setError(null)
    } catch (err) {
      console.error('[useVerticalTools] error:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [vertical])

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

  const saveToolResult = useCallback(async (toolId, resultado) => {
    if (!userId) throw new Error('Usuario no autenticado')
    try {
      const res = await fetch('/api/user/vertical-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, vertical, tool_id: toolId, resultado }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error guardando resultado')
      setTools(prev => ({ ...prev, [toolId]: json.data?.resultado || resultado }))
      setError(null)
      return json.data
    } catch (err) {
      console.error('[useVerticalTools] save error:', err)
      setError(err)
      throw err
    }
  }, [userId, vertical])

  const getToolResult = useCallback((toolId) => tools[toolId] || null, [tools])

  const reload = useCallback(() => {
    if (userId) {
      setLoading(true)
      cargar(userId)
    }
  }, [userId, cargar])

  return { tools, loading, error, saveToolResult, getToolResult, reload }
}
