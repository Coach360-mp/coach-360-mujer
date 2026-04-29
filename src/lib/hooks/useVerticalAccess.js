'use client'

import { useUserPreferences } from './useUserPreferences'
import { getVerticalAccess } from '@/lib/access/getVerticalAccess'

// Devuelve { coach360, mujer, lideres, plan, genero, loading, error }.
// Cada vertical: { visible, accesible, preview }.
// Reglas en src/lib/access/getVerticalAccess.js.
export function useVerticalAccess() {
  const { preferences, loading, error } = useUserPreferences()
  const genero = preferences?.genero || 'prefiero_no_responder'
  const plan = preferences?.plan_actual || 'free'

  const access = getVerticalAccess(plan, genero)

  return {
    ...access,
    // Compat con consumers existentes que usan canAccessMujer/Lideres/Coach360
    canAccessCoach360: access.coach360.accesible,
    canAccessMujer:    access.mujer.accesible || access.mujer.preview, // visible si preview o accesible
    canAccessLideres:  access.lideres.accesible || access.lideres.preview,
    plan,
    genero,
    loading,
    error,
  }
}
