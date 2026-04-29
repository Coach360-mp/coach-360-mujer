// Recomienda un coach (leo/clara/marco) a partir de los datos del onboarding universal.
// Sin test extra: deriva de áreas + momento + identidad + género ya capturados.

const AREAS_LIDERAZGO  = ['liderazgo']
const AREAS_EMOCIONAL  = ['estres', 'relaciones', 'confianza', 'cambio', 'proposito']
const AREAS_EJECUCION  = ['carrera', 'finanzas', 'mental', 'tiempo', 'habitos', 'salud']
const IDENTIDAD_LIDERAZGO = ['lidera']

// Devuelve { coach: 'leo'|'clara'|'marco', motivo: string, scores: { leo, clara, marco } }
export function recomendarCoach({ areas = [], momento = null, identidad = [], genero = null } = {}) {
  const scores = { leo: 1, clara: 0, marco: 0 } // leo siempre tiene 1 base como default

  // Áreas
  for (const a of areas) {
    if (AREAS_LIDERAZGO.includes(a))   scores.marco += 3
    else if (AREAS_EMOCIONAL.includes(a)) scores.clara += 2
    else if (AREAS_EJECUCION.includes(a)) scores.leo += 2
  }

  // Identidad
  for (const i of identidad) {
    if (IDENTIDAD_LIDERAZGO.includes(i)) scores.marco += 2
  }

  // Momento (estilo actual del onboarding general)
  if (momento === 'agotado' || momento === 'cambio') scores.clara += 1
  if (momento === 'disciplinado' || momento === 'ambicioso') scores.leo += 1
  if (momento === 'disperso' || momento === 'empezando') scores.leo += 1

  // Empate: prioridad marco > clara > leo (más específico gana)
  const ranking = ['marco', 'clara', 'leo']
  let coachGanador = 'leo'
  let mejor = -Infinity
  for (const c of ranking) {
    if (scores[c] > mejor) { mejor = scores[c]; coachGanador = c }
  }

  const motivos = {
    leo:   'Tu foco está en ejecución y resultados concretos. Leo es directo, práctico y motivador — te empuja a pasar del saber al hacer.',
    clara: 'Lo que estás trabajando tiene una capa emocional importante. Clara es empática, exploratoria y validante — te ayuda a ver con más claridad lo que estás sintiendo.',
    marco: 'Lideras personas o tomás decisiones que afectan a otros. Marco es estratégico, desafiante y exigente — te ayuda a liderar mejor.',
  }

  return {
    coach: coachGanador,
    motivo: motivos[coachGanador],
    scores,
  }
}
