'use client'

import { useUserPreferences } from './useUserPreferences'

// Devuelve { canAccessMujer, canAccessLideres, canAccessCoach360, loading, error }.
// Reglas:
//   - Coach 360: siempre.
//   - Líderes: siempre.
//   - Mujer: solo si genero ∈ {'mujer', 'prefiero_no_responder'} o no hay preferencias guardadas (caso default).
export function useVerticalAccess() {
  const { preferences, loading, error } = useUserPreferences()
  const genero = preferences?.genero || 'prefiero_no_responder'
  return {
    canAccessCoach360: true,
    canAccessLideres: true,
    canAccessMujer: genero !== 'hombre',
    genero,
    loading,
    error,
  }
}
