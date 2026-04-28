// Configuración por vertical (mujer, general, lideres).
// Centraliza datos vertical-specific para que <CoachDashboard /> sea reusable.

const COACH_CONFIG = {
  mujer: {
    vertical: 'mujer',
    dataV: 'clara',
    coach: {
      name: 'Clara',
      img: '/clara.jpg',
      credential: 'Coach certificada',
      desc: 'Tu compañera de crecimiento. Te escucha, te hace preguntas poderosas y te ayuda a ver con más claridad.',
      tag: 'Coach 360 Mujer',
    },
    // Roster por plan (solo mujer tiene "elevación" Clara → Sofía → Victoria).
    coachesPorPlan: {
      free: { name: 'Clara', photo: '/clara.jpg', credential: 'Coach certificada', desc: 'Tu compañera de crecimiento. Te escucha, te hace preguntas poderosas y te ayuda a ver con más claridad.' },
      esencial: { name: 'Sofía', photo: '/sofia.jpg', credential: 'Coach + Especialista en autodesarrollo', desc: 'Te recomienda herramientas, tests y módulos según lo que necesitas. Integra estrategias de bienestar integral.' },
      premium: { name: 'Victoria', photo: '/victoria.jpg', credential: 'Coach + Neurobiología + Mentora', desc: 'Te da seguimiento personalizado, recuerda tus conversaciones y usa neurociencia aplicada para guiarte.' },
    },
    // Endpoints + tablas
    chatEndpoint: '/api/chat',
    conversacionesTable: 'conversaciones_clara',
    mensajesTable: 'mensajes_clara',
    // Rutas
    landingPath: '/',
    onboardingPath: '/onboarding',
    // Saludo inicial primera vez
    saludoFresco: (nombre) => `Hola${nombre ? ', ' + nombre : ''} ✦\n\nSoy Clara. Estoy aquí para acompañarte — no a darte respuestas, sino a ayudarte a encontrar las tuyas.\n\n¿De qué quieres que hablemos hoy?`,
    saludoConocida: (nombre) => `${nombre ? nombre + ', bienvenida' : 'Bienvenida'} ✦\n\nYa sé quién eres y qué buscas. Estoy aquí.\n\n¿De qué quieres que hablemos hoy?`,
    // Frases coach para BadgeCelebrationModal — claves = badge.condicion.
    frasesBadge: {
      primera_conversacion_clara: 'Empezamos. Lo difícil ya pasó: aparecer.',
      primera_herramienta: 'Una herramienta usada vale más que diez leídas.',
      primer_test: 'El primer test no se trata de los resultados — se trata de mirarte.',
      primer_modulo: 'Empezar es donde la mayoría no llega.',
      modulo_completado: 'Terminar lo que empiezas es la fortaleza más rara.',
      todos_tests: 'Te miraste desde todos los ángulos. Eso requiere coraje.',
      racha_3: 'Tres días seguidos. Eso ya es un patrón, no un impulso.',
      racha_7: 'Una semana completa volviendo a ti. Eso no es pequeño.',
      racha_30: 'Un mes. Esto ya es quien eres, no lo que haces.',
      primera_voz: 'Tu voz dice cosas que el texto esconde.',
      checkin_semanal: 'Siete check-ins. Cada uno es un sí silencioso a ti.',
      equilibrio_7: 'Equilibrio no es perfección, es atención sostenida.',
    },
    // Plan card copy en pop-ups y planes free
    upsellPlanEsencial: 'Plan Esencial te da chat sin límite diario y todos los módulos.',
  },

  general: {
    vertical: 'general',
    dataV: 'leo',
    coach: {
      name: 'Leo',
      img: '/leo.jpg',
      credential: 'Coach Estratégico',
      desc: 'Te ayuda a pasar del saber al hacer — hábitos, decisiones, resultados concretos.',
      tag: 'Coach 360 General',
    },
    // En general no hay elevación: el mismo Leo en los 3 planes.
    coachesPorPlan: {
      free:     { name: 'Leo', photo: '/leo.jpg', credential: 'Coach Estratégico', desc: 'Te ayuda a pasar del saber al hacer — hábitos, decisiones, resultados concretos.' },
      esencial: { name: 'Leo', photo: '/leo.jpg', credential: 'Coach Estratégico · sin límites', desc: 'Te ayuda a pasar del saber al hacer — hábitos, decisiones, resultados concretos.' },
      premium:  { name: 'Leo', photo: '/leo.jpg', credential: 'Coach Estratégico · 3 verticales', desc: 'Te ayuda a pasar del saber al hacer — hábitos, decisiones, resultados concretos.' },
    },
    chatEndpoint: '/api/chat-general',
    // No persistencia de chat por ahora — el shared component renderiza sidebar de conversaciones solo si conversacionesTable !== null.
    conversacionesTable: null,
    mensajesTable: null,
    landingPath: '/general',
    onboardingPath: '/general/onboarding',
    saludoFresco: (nombre) => `${nombre ? nombre + '.' : 'Hola.'}\n\nSoy Leo. Trabajo contigo para pasar del saber al hacer — hábitos, decisiones, resultados concretos.\n\n¿Qué quieres resolver hoy?`,
    saludoConocida: (nombre) => `${nombre ? nombre + ', de vuelta.' : 'De vuelta.'}\n\nYa sé en qué estás trabajando. ¿Avanzamos?`,
    frasesBadge: {
      primera_conversacion_clara: 'Primera conversación lista. Lo difícil era empezar — eso ya pasó.',
      primera_herramienta: 'Una herramienta usada importa más que diez aprendidas.',
      primer_test: 'No es sobre el resultado — es sobre saber dónde estás parado.',
      primer_modulo: 'Empezaste. La mayoría se queda en pensar en empezar.',
      modulo_completado: 'Cerraste un módulo. Ejecutar es lo que separa.',
      todos_tests: 'Te mediste desde todos los ángulos. Eso es honestidad.',
      racha_3: 'Tres días seguidos. Eso ya es disciplina, no impulso.',
      racha_7: 'Siete días. Eso ya no es motivación — es identidad.',
      racha_30: 'Un mes. Esto ya es como te mueves, no lo que haces.',
      primera_voz: 'Hablar saca lo que escribir esconde.',
      checkin_semanal: 'Siete check-ins. Cada uno es un sí silencioso a tu disciplina.',
      equilibrio_7: 'Equilibrio sostenido siete días. No es perfección — es atención.',
    },
    upsellPlanEsencial: 'Plan Esencial te da chat sin límite diario y todos los módulos.',
  },

  lideres: {
    vertical: 'lideres',
    dataV: 'marco',
    coach: {
      name: 'Marco',
      img: '/marco.jpg',
      credential: 'Coach Ejecutivo',
      desc: 'Te acompaña en decisiones de liderazgo, conversaciones difíciles y construcción de equipo.',
      tag: 'Coach 360 Líderes',
    },
    coachesPorPlan: {
      free:     { name: 'Marco', photo: '/marco.jpg', credential: 'Coach Ejecutivo', desc: 'Te acompaña en decisiones de liderazgo, conversaciones difíciles y construcción de equipo.' },
      esencial: { name: 'Marco', photo: '/marco.jpg', credential: 'Coach Ejecutivo · sin límites', desc: 'Te acompaña en decisiones de liderazgo, conversaciones difíciles y construcción de equipo.' },
      premium:  { name: 'Marco', photo: '/marco.jpg', credential: 'Coach Ejecutivo · 3 verticales', desc: 'Te acompaña en decisiones de liderazgo, conversaciones difíciles y construcción de equipo.' },
    },
    chatEndpoint: '/api/chat-lideres',
    conversacionesTable: null,
    mensajesTable: null,
    landingPath: '/lideres',
    onboardingPath: '/lideres/onboarding',
    saludoFresco: (nombre) => `${nombre ? nombre + '.' : 'Hola.'}\n\nSoy Marco. Trabajo con líderes en lo que pesa — decisiones difíciles, conversaciones incómodas, construir equipo de verdad.\n\n¿Qué tienes encima esta semana?`,
    saludoConocida: (nombre) => `${nombre ? nombre + '.' : ''}\n\nLa última vez quedamos en algo. ¿Avanzaste o necesitas re-pensarlo?`,
    frasesBadge: {
      primera_conversacion_clara: 'Primera conversación. Pedir ayuda es la decisión más rentable que toma un líder.',
      primera_herramienta: 'Una herramienta aplicada vale más que un curso completo.',
      primer_test: 'Conocerte es la mitad del trabajo de liderar.',
      primer_modulo: 'Empezaste. La mayoría sigue postergando esto.',
      modulo_completado: 'Cerraste un módulo. Ejecutar es la moneda más cara en liderazgo.',
      todos_tests: 'Te miraste desde todos los ángulos. Eso no es debilidad, es disciplina.',
      racha_3: 'Tres días. La constancia es la práctica más subestimada en liderazgo.',
      racha_7: 'Siete días seguidos. La constancia es la moneda más cara en liderazgo. La estás pagando.',
      racha_30: 'Un mes completo. Esto ya es quien eres, no lo que haces.',
      primera_voz: 'La voz revela lo que el texto pulía.',
      checkin_semanal: 'Siete check-ins. Eso es lo que llaman "operating cadence" — y la tienes.',
      equilibrio_7: 'Siete días de equilibrio. No es soft — es lo que sostiene la dureza.',
    },
    upsellPlanEsencial: 'Plan Esencial te da chat sin límite diario y todos los módulos.',
  },
}

export function getCoachConfig(vertical) {
  return COACH_CONFIG[vertical] || COACH_CONFIG.mujer
}

export const VERTICALES_VALIDAS = Object.keys(COACH_CONFIG)

export default COACH_CONFIG
