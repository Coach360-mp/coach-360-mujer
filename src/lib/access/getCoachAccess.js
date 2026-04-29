// Acceso a coaches según plan. Leo siempre disponible; Clara y Marco requieren plan pago.

export function getCoachAccess(plan) {
  return {
    leo:   true,
    clara: plan === 'esencial' || plan === 'premium',
    marco: plan === 'esencial' || plan === 'premium',
  }
}

export function canSelectCoach(coachId, plan) {
  return getCoachAccess(plan)[coachId] === true
}
