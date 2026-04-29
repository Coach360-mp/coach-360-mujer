// Acceso a verticales según plan + género.
// Coach 360: siempre. Mujer: solo si genero != hombre. Líderes: visible para todos, accesible con plan pago.
// Preview = ven la pestaña pero contenido locked con CTA upgrade.

export function getVerticalAccess(plan, genero) {
  const tienePlanPago = plan === 'esencial' || plan === 'premium'
  const generoPermiteMujer = genero === 'mujer' || genero === 'prefiero_no_responder' || !genero

  return {
    coach360: {
      visible: true,
      accesible: true,
      preview: false,
    },
    mujer: {
      visible:   generoPermiteMujer,
      accesible: tienePlanPago && generoPermiteMujer,
      preview:   !tienePlanPago && generoPermiteMujer,
    },
    lideres: {
      visible:   true,
      accesible: tienePlanPago,
      preview:   !tienePlanPago,
    },
  }
}
