'use client'

import { useCallback } from 'react'
import { useUserPreferences } from './useUserPreferences'
import { getCoachAccess, canSelectCoach } from '@/lib/access/getCoachAccess'

// Devuelve { coachActual, access: {leo, clara, marco}, plan, loading, error,
//            cambiarCoach(coachNuevo, motivo?) }
export function useCoachSelection() {
  const { preferences, loading, error, updatePreferences, userId, reload } = useUserPreferences()
  const plan = preferences?.plan_actual || 'free'
  const coachActual = preferences?.coach_actual || 'leo'
  const access = getCoachAccess(plan)

  const cambiarCoach = useCallback(async (coachNuevo, motivo = null) => {
    if (!userId) throw new Error('Usuario no autenticado')
    if (!canSelectCoach(coachNuevo, plan)) {
      const err = new Error('Plan insuficiente para este coach')
      err.requiere = 'esencial'
      throw err
    }
    const res = await fetch('/api/user/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, coach_nuevo: coachNuevo, motivo }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Error cambiando coach')
    reload()
    return json.data
  }, [userId, plan, reload])

  return { coachActual, access, plan, loading, error, cambiarCoach }
}
