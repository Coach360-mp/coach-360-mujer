// Mapping vertical BD ↔ UI.
// La BD mantiene 'general' por compat con tablas existentes (tests, modulos, templates).
// La UI muestra 'coach360' como nombre de marca para la pestaña Coach 360.

export const VERTICAL_BD_TO_UI = {
  general: 'coach360',
  mujer:   'mujer',
  lideres: 'lideres',
}

export const VERTICAL_UI_TO_BD = {
  coach360: 'general',
  mujer:    'mujer',
  lideres:  'lideres',
}

export const VERTICALES_UI = ['coach360', 'mujer', 'lideres']
export const VERTICALES_BD = ['general', 'mujer', 'lideres']

export const COACHES = ['leo', 'clara', 'marco']

export const PLANES = ['free', 'esencial', 'premium']

export const MSG_LIMITS = {
  free:     5,
  esencial: 20,
  premium:  Infinity,
}

// Helpers
export function verticalUItoBD(uiName) {
  return VERTICAL_UI_TO_BD[uiName] || uiName
}

export function verticalBDtoUI(bdName) {
  return VERTICAL_BD_TO_UI[bdName] || bdName
}
