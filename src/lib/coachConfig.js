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
    // chat persistido en tabla unificada `conversaciones` + `mensajes` (filtrado por coach + vertical)
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
    planes: [
      { id: 'free', nombre: 'Gratis', features: ['Clara como tu coach', '3 conversaciones por semana', '2 tests básicos', 'Check-in diario', 'Mi Equilibrio'] },
      { id: 'esencial', nombre: 'Esencial', popular: true, features: ['Clara sin límites', 'Conversaciones ilimitadas', 'Todos los tests y herramientas', 'Todos los módulos', 'Mi Equilibrio completo', 'Acceso solo a Coach 360 Mujer'] },
      { id: 'premium', nombre: 'Premium', features: ['Todo lo de Esencial', 'Acceso a las 3 verticales (Mujer + General + Líderes)', 'Memoria cruzada entre coaches', 'Coaching con voz', 'Acceso anticipado a nuevo contenido', 'Soporte prioritario'] },
    ],
    dimensiones: [
      { key: 'mente',    label: 'Mente',    desc: '¿Alimentaste tu mente hoy?',     color: '#6366f1' },
      { key: 'cuerpo',   label: 'Cuerpo',   desc: '¿Te moviste hoy?',                color: '#10b981' },
      { key: 'corazon',  label: 'Corazón',  desc: '¿Cómo estás emocionalmente?',     color: '#f59e0b' },
      { key: 'espiritu', label: 'Espíritu', desc: '¿Tuviste un momento de calma?',   color: '#8b5cf6' },
    ],
    habitosSugeridos: {
      mente:    ['Leer 20 minutos', 'Meditar', 'Escribir en un diario', 'Aprender algo nuevo', 'Hacer un puzzle', 'Escuchar un podcast', 'Desconectarme del celular 1 hora', 'Journaling matutino'],
      cuerpo:   ['Caminar 30 minutos', 'Pilates', 'Gimnasio', 'Yoga', 'Tomar 2 litros de agua', 'Dormir 8 horas', 'Comer 5 porciones de verduras', 'Estirarme 10 minutos'],
      corazon:  ['Llamar a alguien querido', 'Expresar agradecimiento', 'Journaling emocional', 'Conectar con amigas', 'Cuidar a alguien', 'Escribir lo que sentí hoy', 'Pasar tiempo con mi pareja', 'Tiempo con mis hijos'],
      espiritu: ['Meditación guiada', 'Caminar en naturaleza', 'Oración', 'Momento de silencio', 'Respiración consciente', 'Leer algo inspirador', 'Gratitud al dormir', 'Contemplación'],
    },
    animos: [
      { label: 'Difícil',   value: 1 },
      { label: 'Regular',   value: 2 },
      { label: 'Bien',      value: 3 },
      { label: 'Muy bien',  value: 4 },
      { label: 'Increíble', value: 5 },
    ],
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
    // chat unificado: filtra por coach='leo' + vertical='general'
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
    planes: [
      { id: 'free', nombre: 'Gratis', features: ['Leo como tu coach', '3 conversaciones por semana', 'Check-in diario', 'Hábitos básicos'] },
      { id: 'esencial', nombre: 'Esencial', popular: true, features: ['Leo sin límites', 'Conversaciones ilimitadas', 'Todos los tests y herramientas', 'Mi Equilibrio completo', 'Acceso solo a Coach 360 General'] },
      { id: 'premium', nombre: 'Premium', features: ['Todo lo de Esencial', 'Acceso a las 3 verticales (Mujer + General + Líderes)', 'Memoria cruzada entre coaches', 'Acceso anticipado a nuevo contenido', 'Soporte prioritario'] },
    ],
    dimensiones: [
      { key: 'mente',    label: 'Mente',       desc: '¿Alimentaste tu enfoque hoy?',         color: '#6366f1' },
      { key: 'cuerpo',   label: 'Cuerpo',      desc: '¿Moviste tu cuerpo?',                  color: '#10b981' },
      { key: 'corazon',  label: 'Relaciones',  desc: '¿Conectaste con alguien?',             color: '#f59e0b' },
      { key: 'espiritu', label: 'Propósito',   desc: '¿Trabajaste en lo importante?',        color: '#8b5cf6' },
    ],
    habitosSugeridos: {
      mente:    ['Leer 30 minutos', 'Deep work 90 min', 'Meditar', 'Aprender algo técnico', 'Desconexión digital', 'Journaling', 'Podcast formativo', 'Revisar metas'],
      cuerpo:   ['Gimnasio', 'Correr', 'HIIT', 'Caminar 10k pasos', 'Ayuno intermitente', 'Dormir 7+ horas', 'Hidratación', 'Estiramiento'],
      corazon:  ['Llamar a alguien', 'Networking 1:1', 'Quality time familia', 'Mensaje intencional', 'Practicar agradecimiento', 'Pedir feedback', 'Resolver un conflicto', 'Mentoría'],
      espiritu: ['Revisar objetivos', 'Trabajar en el proyecto importante', 'Planificar el día', 'Review semanal', 'Lectura inspiradora', 'Momento de claridad', 'Reflexión estratégica', 'Decisión difícil'],
    },
    animos: [
      { label: 'Difícil',   value: 1 },
      { label: 'Regular',   value: 2 },
      { label: 'Bien',      value: 3 },
      { label: 'Muy bien',  value: 4 },
      { label: 'En fuego',  value: 5 },
    ],
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
    // chat unificado: filtra por coach='marco' + vertical='lideres'
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
    planes: [
      { id: 'free', nombre: 'Gratis', features: ['Marco como tu coach', '3 conversaciones por semana', 'Check-in diario', 'Hábitos básicos de liderazgo'] },
      { id: 'esencial', nombre: 'Esencial', popular: true, features: ['Marco sin límites', 'Conversaciones ilimitadas', 'Todos los tests y herramientas ejecutivos', 'Mi Equilibrio completo', 'Acceso solo a Coach 360 Líderes'] },
      { id: 'premium', nombre: 'Premium', features: ['Todo lo de Esencial', 'Acceso a las 3 verticales (Mujer + General + Líderes)', 'Memoria cruzada entre coaches', 'Sesiones 1:1 con coaches humanos', 'Acceso anticipado a nuevo contenido', 'Soporte prioritario'] },
    ],
    dimensiones: [
      { key: 'mente',    label: 'Mente',    desc: '¿Pensaste con claridad hoy?',         color: '#818cf8' },
      { key: 'cuerpo',   label: 'Cuerpo',   desc: '¿Cuidaste tu energía?',                color: '#34d399' },
      { key: 'corazon',  label: 'Corazón',  desc: '¿Conectaste con tu equipo?',           color: '#f472b6' },
      { key: 'espiritu', label: 'Espíritu', desc: '¿Trabajaste en lo importante?',        color: '#fbbf24' },
    ],
    habitosSugeridos: {
      mente:    ['Revisar métricas del equipo', 'Deep work 90 min', 'Revisar prioridades', 'Leer algo estratégico', 'Journaling ejecutivo', 'Pensar sin interrupciones', 'Revisar decisiones de la semana', 'Meditar'],
      cuerpo:   ['Gimnasio', 'Correr', 'Dormir 7+ horas', 'No revisar mail antes de las 9', 'Caminar entre reuniones', 'Hidratarme', 'Pausa de 10 min cada 2 horas', 'Almuerzo sin pantalla'],
      corazon:  ['1:1 con alguien del equipo', 'Dar un feedback concreto', 'Reconocer un logro público', 'Escuchar sin interrumpir', 'Preguntar cómo están', 'Conectar con un par', 'Mentoría', 'Resolver un conflicto pendiente'],
      espiritu: ['Revisar OKRs', 'Trabajo profundo en proyecto clave', 'Planificar la semana', 'Review de resultados', 'Decisión difícil postergada', 'Pensar a 90 días', 'Eliminar una reunión', 'Delegar algo'],
    },
    animos: [
      { label: 'Cansado',     value: 1 },
      { label: 'Presionado',  value: 2 },
      { label: 'Enfocado',    value: 3 },
      { label: 'Claro',       value: 4 },
      { label: 'Motivado',    value: 5 },
    ],
  },
}

export function getCoachConfig(vertical) {
  return COACH_CONFIG[vertical] || COACH_CONFIG.mujer
}

export const VERTICALES_VALIDAS = Object.keys(COACH_CONFIG)

export default COACH_CONFIG
