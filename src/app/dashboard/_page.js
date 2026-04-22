'use client'

import { useState, useEffect, useRef } from 'react'
import { solicitarPermisoNotificaciones } from '@/lib/firebase'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const coaches = {
  free: { name: 'Clara', photo: '/clara.jpg', credential: 'Coach certificada', desc: 'Tu compañera de crecimiento. Te escucha, te hace preguntas poderosas y te ayuda a ver con más claridad.' },
  esencial: { name: 'Sofía', photo: '/sofia.jpg', credential: 'Coach + Especialista en autodesarrollo', desc: 'Te recomienda herramientas, tests y módulos según lo que necesitas. Integra estrategias de bienestar integral.' },
  premium: { name: 'Victoria', photo: '/victoria.jpg', credential: 'Coach + Neurobiología + Mentora', desc: 'Te da seguimiento personalizado, recuerda tus conversaciones y usa neurociencia aplicada para guiarte.' },
}

const planes = [
  {
    id: 'free',
    nombre: 'Gratis',
    features: [
      'Clara como tu coach',
      '3 conversaciones por semana',
      '2 tests básicos',
      'Check-in diario',
      'Mi Equilibrio',
    ],
  },
  {
    id: 'esencial',
    nombre: 'Esencial',
    features: [
      'Clara sin límites',
      'Conversaciones ilimitadas',
      'Todos los tests y herramientas',
      'Todos los módulos',
      'Mi Equilibrio completo',
      'Acceso solo a Coach 360 Mujer',
    ],
    popular: true,
  },
  {
    id: 'premium',
    nombre: 'Premium',
    features: [
      'Todo lo de Esencial',
      'Acceso a las 3 verticales (Mujer + General + Líderes)',
      'Memoria cruzada entre coaches',
      'Coaching con voz',
      'Acceso anticipado a nuevo contenido',
      'Soporte prioritario',
    ],
  },
]

const dimensiones = [
  { key: 'mente', label: 'Mente', desc: '¿Alimentaste tu mente hoy?', color: '#6366f1' },
  { key: 'cuerpo', label: 'Cuerpo', desc: '¿Te moviste hoy?', color: '#10b981' },
  { key: 'corazon', label: 'Corazón', desc: '¿Cómo estás emocionalmente?', color: '#f59e0b' },
  { key: 'espiritu', label: 'Espíritu', desc: '¿Tuviste un momento de calma?', color: '#8b5cf6' },
]

const animos = [{ label: 'Difícil', value: 1 }, { label: 'Regular', value: 2 }, { label: 'Bien', value: 3 }, { label: 'Muy bien', value: 4 }, { label: 'Increíble', value: 5 }]

const habitosSugeridos = {
  mente: ['Leer 20 minutos', 'Meditar', 'Escribir en un diario', 'Aprender algo nuevo', 'Hacer un puzzle', 'Escuchar un podcast', 'Desconectarme del celular 1 hora', 'Journaling matutino'],
  cuerpo: ['Caminar 30 minutos', 'Pilates', 'Gimnasio', 'Yoga', 'Tomar 2 litros de agua', 'Dormir 8 horas', 'Comer 5 porciones de verduras', 'Estirarme 10 minutos'],
  corazon: ['Llamar a alguien querido', 'Expresar agradecimiento', 'Journaling emocional', 'Conectar con amigas', 'Cuidar a alguien', 'Escribir lo que sentí hoy', 'Pasar tiempo con mi pareja', 'Tiempo con mis hijos'],
  espiritu: ['Meditación guiada', 'Caminar en naturaleza', 'Oración', 'Momento de silencio', 'Respiración consciente', 'Leer algo inspirador', 'Gratitud al dormir', 'Contemplación'],
}

const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const elementProfiles = {
  1: { nombre: 'Agua', icono: '💧', color: '#0ea5e9', colorBg: 'rgba(14, 165, 233, 0.12)', desc: 'Eres profunda, intuitiva y empática. Sientes antes de pensar.', descLarga: 'Tu naturaleza fluye con las emociones — las tuyas y las de quienes te rodean. Tienes una capacidad poco común de leer entre líneas, percibir lo no dicho y conectar con la verdad emocional de cada situación.', fortalezas: ['Empatía profunda con otros', 'Intuición que rara vez se equivoca', 'Capacidad de crear vínculos auténticos', 'Sensibilidad para captar lo que otros no ven'], sombras: ['Puedes perderte en las emociones de otros', 'A veces evitas la confrontación necesaria', 'Cargas con peso que no es tuyo'], recomendaciones: ['Practica poner límites desde el amor, no desde el miedo', 'Pregúntate: ¿esta emoción es mía o la estoy absorbiendo?', 'Date espacios de soledad para reconectar contigo misma'], proximoPaso: 'El módulo "Gestión Emocional" está diseñado para ti.', promptClara: 'Acabo de descubrir que mi elemento es Agua. Me gustaría conversar sobre cómo gestionar mejor mi sensibilidad emocional sin perderme en las emociones de otros.' },
  2: { nombre: 'Tierra', icono: '🌱', color: '#84cc16', colorBg: 'rgba(132, 204, 22, 0.12)', desc: 'Eres estable, práctica y confiable. Analizas antes de actuar.', descLarga: 'Tu fortaleza es la solidez. Eres el ancla en momentos de tormenta, la voz de la razón, la que construye paso a paso lo que otras solo sueñan.', fortalezas: ['Estabilidad que inspira confianza', 'Capacidad de planificar y ejecutar', 'Paciencia para los procesos largos', 'Pragmatismo que evita errores costosos'], sombras: ['Te cuesta soltar el control', 'A veces pierdes oportunidades por sobreanalizar', 'Puedes volverte rígida ante el cambio'], recomendaciones: ['Practica decir sí a algo nuevo cada semana sin planearlo', 'Permítete equivocarte — la perfección es una jaula', 'Confía en otros para soltar parte del peso'], proximoPaso: 'La herramienta "Pausa Antes de Decidir" te va a sorprender.', promptClara: 'Mi elemento es Tierra. Soy muy analítica y me cuesta soltar el control. Quiero trabajar en confiar más y permitirme fluir.' },
  3: { nombre: 'Fuego', icono: '🔥', color: '#f97316', colorBg: 'rgba(249, 115, 22, 0.12)', desc: 'Eres apasionada, directa y valiente. Actúas antes de dudar.', descLarga: 'Tu energía es contagiosa. Donde otras ven obstáculos, tú ves desafíos. Cuando te comprometes con algo, lo das todo.', fortalezas: ['Determinación que mueve montañas', 'Coraje para iniciar lo que otras posponen', 'Pasión que inspira a quienes te rodean', 'Honestidad directa, sin máscaras'], sombras: ['A veces respondes antes de escuchar', 'Puedes quemarte por exceso de intensidad', 'Tu directness puede herir sin querer'], recomendaciones: ['Antes de responder, respira 3 veces', 'Aprende la diferencia entre directo y abrupto', 'Programa pausas reales — no son debilidad, son estrategia'], proximoPaso: 'La herramienta "Reset de 10 Minutos" es tu mejor aliada esta semana.', promptClara: 'Mi elemento es Fuego. Soy intensa y directa, pero a veces actúo antes de pensar.' },
  4: { nombre: 'Aire', icono: '🌬️', color: '#a78bfa', colorBg: 'rgba(167, 139, 250, 0.12)', desc: 'Eres creativa, adaptable y libre. Exploras antes de comprometerte.', descLarga: 'Tu mente vuela alto y conecta ideas que otras no ven. Eres la que llena espacios de chispa, humor y posibilidades nuevas.', fortalezas: ['Creatividad que rompe esquemas', 'Adaptabilidad ante el cambio', 'Visión amplia y conectiva', 'Capacidad de reinventarte'], sombras: ['Te cuesta sostener compromisos largos', 'Saltas de idea en idea sin profundizar', 'A veces evitas el peso de las emociones difíciles'], recomendaciones: ['Elige UNA cosa esta semana y termínala', 'Practica quedarte 5 minutos más en una conversación incómoda', 'Profundiza en algo que ya conoces antes de buscar lo nuevo'], proximoPaso: 'El módulo "Decisiones Alineadas" te va a ayudar a sostener tus elecciones.', promptClara: 'Mi elemento es Aire. Soy creativa pero me cuesta profundizar y sostener compromisos.' },
}

// Iconos SVG del diseño de Fase 5 (líneas 906-958 del HTML de referencia).
const Icon = {
  sparkle: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1v3M8 12v3M1 8h3M12 8h3M3 3l2 2M11 11l2 2M3 13l2-2M11 5l2-2"/>
    </svg>
  ),
  check: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7"/></svg>
  ),
  arrow: ({ s = 14, dir = 'right' }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: dir === 'left' ? 'rotate(180deg)' : dir === 'up' ? 'rotate(-90deg)' : dir === 'down' ? 'rotate(90deg)' : 'none' }}>
      <path d="M3 8h10M9 4l4 4-4 4"/>
    </svg>
  ),
  lock: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/>
    </svg>
  ),
  mic: ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="1.5" width="4" height="8" rx="2"/><path d="M3 7a5 5 0 0 0 10 0M8 12v2.5"/>
    </svg>
  ),
  plus: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
  ),
  dots: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="13" cy="8" r="1.4"/></svg>
  ),
  moon: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 9.5A5.5 5.5 0 1 1 6.5 3a4.5 4.5 0 0 0 6.5 6.5z"/></svg>
  ),
  chart: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 13h12M4 10v3M7 7v6M10 4v9M13 8v5"/></svg>
  ),
  star: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor" stroke="none"><path d="M8 1.5l1.8 4 4.2.4-3.2 2.9.9 4.2L8 10.8l-3.7 2.2.9-4.2L2 5.9l4.2-.4z"/></svg>
  ),
  close: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
  ),
  flame: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"><path d="M8 1s4 3 4 7a4 4 0 1 1-8 0c0-1.5 1-2.5 1.5-3C5.5 4 6 2.5 8 1z"/><path d="M8 10a1.5 1.5 0 0 0 1.5-1.5c0-.8-1-1.5-1.5-2-.5.5-1.5 1.2-1.5 2A1.5 1.5 0 0 0 8 10z"/></svg>
  ),
  book: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h4a2 2 0 0 1 2 2v9a2 2 0 0 0-2-2H3zM13 3H9a2 2 0 0 0-2 2v9a2 2 0 0 1 2-2h4z"/></svg>
  ),
  compass: ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M10.5 5.5L9 9l-3.5 1.5L7 7z" fill="currentColor"/></svg>
  ),
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [view, setView] = useState('inicio')
  const [prevView, setPrevView] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tests, setTests] = useState([])
  const [herramientas, setHerramientas] = useState([])
  const [modulos, setModulos] = useState([])
  const [activeTest, setActiveTest] = useState(null)
  const [testQuestions, setTestQuestions] = useState([])
  const [testStep, setTestStep] = useState(0)
  const [testAnswers, setTestAnswers] = useState([])
  const [testResult, setTestResult] = useState(null)
  const [activeHerramienta, setActiveHerramienta] = useState(null)
  const [herramientaStep, setHerramientaStep] = useState(0)
  const [herramientaReflexion, setHerramientaReflexion] = useState('')
  const [herramientaCompletada, setHerramientaCompletada] = useState(false)
  const [chatMsgs, setChatMsgs] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [conversacionActiva, setConversacionActiva] = useState(null)
  const [conversaciones, setConversaciones] = useState([])
  const [chatSidebarAbierto, setChatSidebarAbierto] = useState(false)
  const [contextoAbierto, setContextoAbierto] = useState(false)
  const [checkinDone, setCheckinDone] = useState(false)
  const [animoHoy, setAnimoHoy] = useState(null)
  const [equilibrio, setEquilibrio] = useState({ mente: 0, cuerpo: 0, corazon: 0, espiritu: 0 })
  const [habitosUsuario, setHabitosUsuario] = useState([])
  const [habitosCompletados, setHabitosCompletados] = useState([])
  const [configurandoHabitos, setConfigurandoHabitos] = useState(false)
  const [configDimension, setConfigDimension] = useState(0)
  const [habitosSeleccionados, setHabitosSeleccionados] = useState({ mente: [], cuerpo: [], corazon: [], espiritu: [] })
  const [nuevoHabito, setNuevoHabito] = useState('')
  const [statModal, setStatModal] = useState(null)
  const [pricing, setPricing] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [progresoModulos, setProgresoModulos] = useState([])
  const [activeModulo, setActiveModulo] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [primerasSesion, setPrimeraSesion] = useState(false)
  const [sesionPaso, setSesionPaso] = useState(0)
  const [sesionAnimo, setSesionAnimo] = useState(null)
  const [sesionTourPaso, setSesionTourPaso] = useState(0)
  const [sesionMostrarTour, setSesionMostrarTour] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const chatEndRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const router = useRouter()

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMsgs, typing])
  useEffect(() => { checkUser() }, [])
  useEffect(() => { if (user?.id) cargarConversaciones() }, [user?.id])

  async function cargarConversaciones() {
    if (!user?.id) return
    const { data } = await supabase
      .from('conversaciones_clara')
      .select('id, titulo, fecha_inicio, ultimo_mensaje')
      .eq('usuario_id', user.id)
      .eq('activa', true)
      .order('ultimo_mensaje', { ascending: false })
      .limit(20)
    setConversaciones(data || [])
  }

  async function abrirConversacion(convId) {
    const { data } = await supabase
      .from('mensajes_clara')
      .select('rol, contenido, fecha')
      .eq('conversacion_id', convId)
      .order('fecha', { ascending: true })
    setChatMsgs((data || []).map(m => ({
      r: m.rol === 'user' ? 'u' : 'a',
      t: m.contenido,
      createdAt: m.fecha,
    })))
    setConversacionActiva(convId)
    setChatSidebarAbierto(false)
  }

  function nuevaConversacion() {
    setChatMsgs([])
    setConversacionActiva(null)
    setChatSidebarAbierto(false)
  }

  function agruparConvs(convs) {
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 86400000)
    const g = { hoy: [], semana: [], anterior: [] }
    convs.forEach(c => {
      const t = new Date(c.ultimo_mensaje)
      if (t >= startOfToday) g.hoy.push(c)
      else if (t >= sevenDaysAgo) g.semana.push(c)
      else g.anterior.push(c)
    })
    return g
  }

  const plan = perfil?.plan_actual || 'free'
  const coach = coaches[plan] || coaches.free

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUser(user)
    const { data: profile } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
    setPerfil(profile)
    if (!profile?.primera_sesion_completada) { setPrimeraSesion(true) }
    const currentCoach = coaches[profile?.plan_actual || 'free']
    setChatMsgs([{ r: 'a', t: `Hola${perfil?.nombre ? ', ' + perfil.nombre : ''} ✦\n\nSoy Clara. Estoy aquí para acompañarte — no a darte respuestas, sino a ayudarte a encontrar las tuyas.\n\n¿De qué quieres que hablemos hoy?` }])
    const { data: t } = await supabase.from('tests').select('*').eq('activo', true).eq('vertical', 'mujer').order('orden')
    const { data: h } = await supabase.from('templates').select('*').eq('activo', true).eq('vertical', 'mujer').order('orden')
    const { data: m } = await supabase.from('modulos').select('*').eq("activo", true).eq("vertical", "mujer").order("orden")
    if (t) setTests(t)
    if (h) setHerramientas(h)
    if (m) setModulos(m)

    // Cargar progreso de módulos
    const { data: prog } = await supabase.from('progreso_modulos').select('*').eq('usuario_id', user.id)
    if (prog) setProgresoModulos(prog)

    // Cargar hábitos personalizados y completados del día
    const hoy = new Date().toISOString().split('T')[0]
    const { data: hab } = await supabase.from('habitos_usuario').select('*').eq('user_id', user.id).eq('activo', true)
    const { data: hcomp } = await supabase.from('habitos_completados').select('*').eq('user_id', user.id).eq('fecha', hoy)
    if (hab) setHabitosUsuario(hab)
    if (hcomp) setHabitosCompletados(hcomp.map(c => c.habito_id))

    // Cargar precios según país
    try {
      const resPricing = await fetch(`/api/pricing?userId=${user.id}`)
      const dataPricing = await resPricing.json()
      if (dataPricing && !dataPricing.error) setPricing(dataPricing)
    } catch (err) { console.error('Error cargando pricing:', err) }

    // Notificaciones FCM
    try {
      setTimeout(() => solicitarPermisoNotificaciones(user.id, supabase), 3000)
    } catch (e) { console.error('Error FCM:', e) }

    setLoading(false)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }
  const navigate = (newView) => { setPrevView(view); setView(newView) }
  const goBack = () => {
    if (activeTest && !testResult) { setActiveTest(null); setTestStep(0); setTestAnswers([]); return }
    if (testResult) { setTestResult(null); setActiveTest(null); setTestStep(0); setTestAnswers([]); return }
    if (activeHerramienta) { setActiveHerramienta(null); setHerramientaStep(0); setHerramientaReflexion(''); setHerramientaCompletada(false); setView('herramientas'); return }
    if (prevView) { setView(prevView); setPrevView(null) }
    else { setView('inicio') }
  }

  const startTest = async (test) => {
    const { data: questions } = await supabase.from('preguntas').select('*').eq('test_id', test.id).order('orden')
    if (questions && questions.length > 0) {
      setTestQuestions(questions); setActiveTest(test); setTestStep(0); setTestAnswers([]); setTestResult(null)
    }
  }

  const answerQuestion = async (value) => {
    const newAnswers = [...testAnswers, value]
    setTestAnswers(newAnswers)
    if (testStep + 1 < testQuestions.length) { setTestStep(testStep + 1) }
    else {
      const puntaje = newAnswers.reduce((a, b) => a + b, 0)

      // Test 4 (Coherencia) usa suma de puntaje con rangos
      // Todos los demás usan valor dominante (1=primero, 2=segundo, etc.)
      const esTestDeRango = activeTest.id === '11111111-1111-1111-1111-111111111104'

      let perfilData = null
      if (esTestDeRango) {
        const { data } = await supabase
          .from('perfiles_resultado')
          .select('*')
          .eq('test_id', activeTest.id)
          .lte('rango_min', puntaje)
          .gte('rango_max', puntaje)
          .single()
        perfilData = data
      } else {
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0 }
        newAnswers.forEach(a => { counts[a] = (counts[a] || 0) + 1 })
        const dominant = parseInt(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0])
        const { data } = await supabase
          .from('perfiles_resultado')
          .select('*')
          .eq('test_id', activeTest.id)
          .eq('rango_min', dominant)
          .eq('rango_max', dominant)
          .single()
        perfilData = data
      }

      const profile = perfilData ? {
        nombre: perfilData.perfil,
        titulo_perfil: perfilData.titulo_perfil,
        descLarga: perfilData.descripcion,
        desc: perfilData.descripcion,
        fortalezas: perfilData.fortalezas ? perfilData.fortalezas.split('. ').filter(Boolean) : [],
        sombras: perfilData.desafios ? perfilData.desafios.split('. ').filter(Boolean) : [],
        recomendaciones: perfilData.recomendacion ? [perfilData.recomendacion] : [],
        proximoPaso: perfilData.recomendacion || '',
        promptClara: `Acabo de hacer el test "${activeTest.titulo}" y mi resultado es "${perfilData.titulo_perfil}". Quiero hablarlo contigo.`,
        color: '#d4af37',
        colorBg: 'rgba(212, 175, 55, 0.12)',
        icono: '✦',
      } : { nombre: 'Explorador', desc: 'Tienes una combinación única.', descLarga: 'Clara te va a ayudar a interpretarlo.', icono: '✦', color: '#d4af37', colorBg: 'rgba(212,175,55,0.12)', fortalezas: [], sombras: [], recomendaciones: [], promptClara: `Acabo de hacer el test "${activeTest?.titulo}". Quiero hablarlo contigo.` }

      setTestResult(profile)
      if (user) {
        await supabase.from('resultados_test').insert({ usuario_id: user.id, test_id: activeTest.id, puntaje_total: puntaje, perfil_resultado: profile.nombre, respuestas: newAnswers })
        await sumarPuntos('test_completado', 20, `Test: ${activeTest.titulo}`)
        try {
          await supabase.from('user_context').upsert({
            user_id: user.id, vertical: 'mujer', context_key: 'ultimo_test_resultado',
            context_value: `Test: ${activeTest.titulo} | Perfil: ${profile.nombre} | ${profile.descLarga?.slice(0, 200)}`,
            source_coach: 'clara', cross_coach: false,
          }, { onConflict: 'user_id,context_key,vertical' })
        } catch (e) { console.error('Error guardando contexto:', e) }
        // Email resultado test
        try {
          fetch('/api/emails/resultado-test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, vertical: 'mujer', testTitulo: activeTest.titulo, perfilResultado: profile.nombre }) })
        } catch (e) { console.error('Error email resultado-test:', e) }
      }
    }
  }

  const startHerramienta = (h) => {
    setActiveHerramienta(h); setHerramientaStep(0); setHerramientaReflexion(''); setHerramientaCompletada(false); navigate('herramienta_activa')
  }

  const completeHerramienta = async () => {
    setHerramientaCompletada(true)
    if (user && herramientaReflexion.trim()) {
      try {
        await supabase.from('resultados_test').insert({ usuario_id: user.id, test_id: null, puntaje_total: 0, perfil_resultado: `Herramienta: ${activeHerramienta.titulo}`, respuestas: { reflexion: herramientaReflexion, herramienta_id: activeHerramienta.id } })
        await sumarPuntos('herramienta_completada', 15, `Herramienta: ${activeHerramienta.titulo}`)
      } catch (err) { console.error('Error guardando reflexión:', err) }
    }
  }

  const sendMessage = async () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim()
    setChatMsgs(prev => [...prev, { r: 'u', t: msg, createdAt: new Date().toISOString() }])
    setChatInput(''); setTyping(true)
    try {
      const history = chatMsgs.map(m => ({ role: m.r === 'a' ? 'assistant' : 'user', content: m.t }))
      history.push({ role: 'user', content: msg })
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, userId: user?.id, conversacionId: conversacionActiva }),
      })
      const data = await res.json()
      setTyping(false)
      const reply = data.reply || 'Cuéntame más ✦'
      setChatMsgs(prev => [...prev, { r: 'a', t: reply, createdAt: new Date().toISOString() }])
      if (data.conversacionId) {
        const esNueva = data.conversacionId !== conversacionActiva
        if (esNueva) setConversacionActiva(data.conversacionId)
        cargarConversaciones()
      }
      speakText(reply)
      const mensajesDelUsuario = chatMsgs.filter(m => m.r === 'u').length
      if (mensajesDelUsuario === 0) {
        sumarPuntos('conversacion_coach', 5, `Conversación con ${coach.name}`)
      }
    } catch {
      setTyping(false)
      setChatMsgs(prev => [...prev, { r: 'a', t: 'Perdona, hubo un error. ¿Puedes intentar de nuevo? ✦', createdAt: new Date().toISOString() }])
    }
  }

  const speakText = async (text) => {
    try {
      const coachKey = Object.keys(coaches).find(k => coaches[k] === coach) || 'clara'
      const res = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, coach: coachKey }) })
      const data = await res.json()
      if (data.audio) {
        setIsPlaying(true)
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`)
        audio.onended = () => setIsPlaying(false)
        audio.play()
      }
    } catch (err) { console.error('TTS error:', err) }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data) }
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        const formData = new FormData()
        formData.append('audio', audioBlob, `audio.${mimeType.includes('webm') ? 'webm' : 'mp4'}`)
        try {
          const res = await fetch('/api/transcribir', { method: 'POST', body: formData })
          const data = await res.json()
          if (data.transcripcion) { setChatInput(data.transcripcion) }
        } catch (e) { console.error('Transcripcion error:', e) }
      }
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) { console.error('Microphone error:', err); setIsRecording(false) }
  }

  const stopRecording = () => { if (mediaRecorderRef.current?.state === 'recording') { mediaRecorderRef.current.stop() } setIsRecording(false) }

  const toggleHabitoSeleccionado = (dim, habito) => {
    setHabitosSeleccionados(prev => {
      const actuales = prev[dim] || []
      const existe = actuales.find(h => h.nombre === habito)
      if (existe) {
        return { ...prev, [dim]: actuales.filter(h => h.nombre !== habito) }
      } else {
        return { ...prev, [dim]: [...actuales, { nombre: habito, dias: [1,2,3,4,5,6,7], horario: null }] }
      }
    })
  }

  const toggleDiaHabito = (dim, habitoNombre, dia) => {
    setHabitosSeleccionados(prev => ({
      ...prev,
      [dim]: prev[dim].map(h => {
        if (h.nombre !== habitoNombre) return h
        const nuevosDias = h.dias.includes(dia) ? h.dias.filter(d => d !== dia) : [...h.dias, dia].sort()
        return { ...h, dias: nuevosDias }
      })
    }))
  }

  const agregarHabitoPropio = (dim) => {
    if (!nuevoHabito.trim()) return
    setHabitosSeleccionados(prev => ({
      ...prev,
      [dim]: [...(prev[dim] || []), { nombre: nuevoHabito.trim(), dias: [1,2,3,4,5,6,7], horario: null }]
    }))
    setNuevoHabito('')
  }

  const guardarHabitos = async () => {
    if (!user) return
    const todosLosHabitos = []
    Object.keys(habitosSeleccionados).forEach(dim => {
      habitosSeleccionados[dim].forEach(h => {
        todosLosHabitos.push({ user_id: user.id, dimension: dim, nombre: h.nombre, dias_semana: h.dias, horario: h.horario, activo: true })
      })
    })
    if (todosLosHabitos.length > 0) {
      const { data } = await supabase.from('habitos_usuario').insert(todosLosHabitos).select()
      if (data) setHabitosUsuario(data)
    }
    setConfigurandoHabitos(false)
    setConfigDimension(0)
  }

  const toggleHabitoCompletado = async (habitoId) => {
    if (!user) return
    const hoy = new Date().toISOString().split('T')[0]
    const yaCompletado = habitosCompletados.includes(habitoId)
    if (yaCompletado) {
      await supabase.from('habitos_completados').delete().eq('habito_id', habitoId).eq('fecha', hoy)
      setHabitosCompletados(prev => prev.filter(id => id !== habitoId))
    } else {
      await supabase.from('habitos_completados').insert({ user_id: user.id, habito_id: habitoId, fecha: hoy })
      setHabitosCompletados(prev => [...prev, habitoId])
      const habito = habitosUsuario.find(h => h.id === habitoId)
      await sumarPuntos('habito', 3, habito ? `Hábito: ${habito.nombre}` : 'Hábito completado')
    }
  }

  const iniciarConfiguracion = () => {
    setConfigurandoHabitos(true)
    setConfigDimension(0)
    setHabitosSeleccionados({ mente: [], cuerpo: [], corazon: [], espiritu: [] })
  }

  const sumarPuntos = async (accion, puntos, descripcion = null) => {
    if (!user) return
    try {
      const { data } = await supabase.rpc('sumar_puntos', {
        p_user_id: user.id,
        p_accion: accion,
        p_puntos: puntos,
        p_descripcion: descripcion,
      })
      if (data) {
        setPerfil(prev => ({
          ...prev,
          puntos_totales: data.puntos_totales,
          nivel: data.nivel,
          racha_dias: data.racha_dias,
          mejor_racha: Math.max(prev?.mejor_racha || 0, data.racha_dias),
        }))
      }
    } catch (err) {
      console.error('Error sumando puntos:', err)
    }
  }


  const completarPrimeraSesion = async () => {
    if (user) {
      await supabase.from('perfiles').update({ primera_sesion_completada: true }).eq('id', user.id)
      if (sesionAnimo) {
        await supabase.from('daily_checkins').insert({ user_id: user.id, vertical: 'mujer', mood: sesionAnimo, created_at: new Date().toISOString() })
      }
      const currentCoach = coaches[perfil?.plan_actual || 'free']
      setChatMsgs([{ r: 'a', t: `${perfil?.nombre ? perfil.nombre + ', bienvenida' : 'Bienvenida'} ✦\n\nYa sé quién eres y qué buscas. Estoy aquí.\n\n¿De qué quieres que hablemos hoy?` }])
    }
    setPrimeraSesion(false)
    setView('clara')
  }

  const animosSesion = [
    { valor: 5, emoji: '✨', label: 'Excelente' },
    { valor: 4, emoji: '😊', label: 'Bien' },
    { valor: 3, emoji: '😐', label: 'Regular' },
    { valor: 2, emoji: '😔', label: 'Difícil' },
    { valor: 1, emoji: '🌧', label: 'Muy difícil' },
  ]

  const tourSlides = [
    { titulo: 'Tests de autoconocimiento', descripcion: 'Cada test que completes alimenta las conversaciones con tu coach. Mientras más hagas, más personalizado se vuelve el acompañamiento.', icono: '🧪' },
    { titulo: 'Hábitos diarios', descripcion: 'Tu coach sabe qué hábitos tienes configurados y cuántos días los cumpliste. No para juzgarte — para acompañarte mejor.', icono: '💚' },
    { titulo: 'Herramientas prácticas', descripcion: 'Ejercicios para generar cambios reales. Tu reflexión queda guardada y tu coach puede usarla contigo en el momento oportuno.', icono: '🛠' },
  ]

  if (primerasSesion) return (
    <div style={{ minHeight: '100vh', background: 'var(--warm)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 3, background: '#f0e8d8', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ height: '100%', background: 'var(--gold)', transition: 'width 0.4s ease', width: sesionMostrarTour ? `${50 + (sesionTourPaso + 1) * 16}%` : sesionPaso === 0 ? '20%' : '40%' }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px 40px' }}>

        {sesionPaso === 0 && !sesionMostrarTour && (
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <img src="/clara.jpg" alt="Clara" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold-light)', marginBottom: 24 }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 12, color: 'var(--text)' }}>Hola, {perfil?.nombre || 'bienvenida'} ✦</h1>
            <p style={{ fontSize: 16, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 8 }}>Soy Clara, tu coach en Coach 360.</p>
            <p style={{ fontSize: 15, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 36 }}>Antes de empezar, hagamos dos cosas juntas. Solo toma un momento.</p>
            <button onClick={() => setSesionPaso(1)} style={{ background: 'var(--dark)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px 40px', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Empecemos →</button>
          </div>
        )}

        {sesionPaso === 1 && !sesionMostrarTour && (
          <div style={{ textAlign: 'center', maxWidth: 360, width: '100%' }}>
            <p style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Check-in de bienvenida</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 8, color: 'var(--text)' }}>¿Cómo llegaste hoy?</h2>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 32 }}>Tu primer registro del día. Arranca tu racha.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {animosSesion.map(a => (
                <button key={a.valor} onClick={() => { setSesionAnimo(a.valor); setSesionMostrarTour(true) }}
                  style={{ background: sesionAnimo === a.valor ? 'var(--dark)' : '#fff', color: sesionAnimo === a.valor ? '#fff' : 'var(--text)', border: '1.5px solid #e8e0d6', borderRadius: 16, padding: '16px 20px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}>
                  <span style={{ fontSize: 24 }}>{a.emoji}</span>
                  <span style={{ fontWeight: 500 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {sesionMostrarTour && (
          <div style={{ textAlign: 'center', maxWidth: 360, width: '100%' }}>
            <p style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24 }}>Tu app</p>
            <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{tourSlides[sesionTourPaso].icono}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12, color: 'var(--text)' }}>{tourSlides[sesionTourPaso].titulo}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.7 }}>{tourSlides[sesionTourPaso].descripcion}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
              {tourSlides.map((_, i) => (
                <div key={i} style={{ width: i === sesionTourPaso ? 24 : 8, height: 8, borderRadius: 4, background: i === sesionTourPaso ? 'var(--gold)' : '#e8e0d6', transition: 'all 0.3s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sesionTourPaso < tourSlides.length - 1 ? (
                <button onClick={() => setSesionTourPaso(sesionTourPaso + 1)} style={{ background: 'var(--dark)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px 40px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Siguiente →</button>
              ) : (
                <button onClick={completarPrimeraSesion} style={{ background: 'var(--dark)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px 40px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Hablar con Clara ✦</button>
              )}
              <button onClick={completarPrimeraSesion} style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: 13, cursor: 'pointer', padding: 8 }}>Saltar tour →</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )

  if (loading) return (<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--warm)' }}><p style={{ color: 'var(--text-light)' }}>Cargando ✦</p></div>)

  const nombre = perfil?.nombre || user?.user_metadata?.full_name || 'Bienvenida'
  const canAccess = (required) => required === 'free' || plan === 'premium' || (plan === 'esencial' && required !== 'premium')

  const handleCheckout = async (planId) => {
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId, userId: user.id, userEmail: user.email, vertical: 'mujer' }) })
      const data = await res.json()
      if (data.url) { window.location.href = data.url }
    } catch (err) { console.error('Checkout error:', err) }
  }

  const Header = ({ title, subtitle, showBack = true }) => (
    <div style={{ padding: '48px 20px 16px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>
      {showBack && <button onClick={goBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text)', padding: '4px 8px' }}>←</button>}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--text-light)', margin: 0 }}>{subtitle}</p>}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f0d0b', paddingBottom: 80, position: 'relative' }}>

      {view === 'inicio' && (
        <div className="dir-ritual" data-v="clara" style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
          <style>{`
            .cd-wrap { display: flex; flex-direction: column; min-height: 100vh; }
            .cd-sidebar { display: none; }
            .cd-sidebar.open { display: flex; flex-direction: column; gap: 2px; position: fixed; top: 0; left: 0; bottom: 0; width: 280px; max-width: 85vw; z-index: 50; padding: 28px 20px; background: var(--ink-2); overflow-y: auto; box-shadow: 0 0 40px rgba(0,0,0,0.6); }
            .cd-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 40; }
            .cd-hamburger { position: fixed; top: 20px; left: 20px; z-index: 45; width: 40px; height: 40px; border-radius: 999px; background: var(--ink-3); border: 1px solid var(--line); color: var(--text); cursor: pointer; display: flex; align-items: center; justify-content: center; }
            .cd-sidebar-close { position: absolute; top: 18px; right: 18px; width: 32px; height: 32px; border-radius: 999px; background: transparent; border: 1px solid var(--line); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; }
            .cd-main { padding: 76px 16px 96px; }
            .cd-hero-row { display: flex; flex-direction: column; gap: 20px; margin-bottom: 28px; }
            .cd-moment { height: 140px; position: relative; border-radius: 16px; overflow: hidden; border: 1px solid var(--line); }
            .cd-coach-card { display: flex; flex-direction: column; gap: 16px; padding: 16px; margin-bottom: 24px; background: linear-gradient(135deg, var(--v-tint), var(--ink-2) 70%); border: 1px solid color-mix(in oklab, var(--v-primary) 22%, var(--line)); border-radius: var(--r-xl); }
            .cd-coach-img-wrap { width: 100%; height: 240px; border-radius: 12px; overflow: hidden; background: var(--ink-3); }
            .cd-checkbal { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
            .cd-community-inner { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
            @media (min-width: 768px) {
              .cd-wrap { display: grid; grid-template-columns: 240px 1fr; }
              .cd-sidebar, .cd-sidebar.open {
                display: flex; flex-direction: column; gap: 2px;
                border-right: 1px solid var(--line);
                padding: 28px 20px; background: var(--ink-2);
                position: static; width: auto; max-width: none; z-index: auto;
                box-shadow: none; top: auto; left: auto; bottom: auto; overflow-y: visible;
              }
              .cd-backdrop, .cd-hamburger, .cd-sidebar-close { display: none; }
              .cd-main { padding: 40px 48px 48px; overflow: auto; }
              .cd-hero-row { display: grid; grid-template-columns: 1fr 280px; gap: 28px; }
              .cd-moment { height: 130px; }
              .cd-coach-card { display: grid; grid-template-columns: 220px 1fr; gap: 24px; padding: 20px; }
              .cd-coach-img-wrap { width: 220px; height: 260px; }
              .cd-checkbal { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }
              .cd-community-inner { flex-direction: row; justify-content: space-between; align-items: center; }
            }
          `}</style>

          {/* Mobile hamburger (visible <768px) */}
          <button className="cd-hamburger" onClick={() => setMenuAbierto(true)} aria-label="Menú">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>

          {/* Mobile backdrop */}
          {menuAbierto && <div className="cd-backdrop" onClick={() => setMenuAbierto(false)} />}

          <div className="cd-wrap">
            {/* sidebar — port literal de RitualDashboard (Fase 5 L1582-1623) */}
            <aside className={`cd-sidebar ${menuAbierto ? 'open' : ''}`}>
              {/* Mobile-only close button */}
              <button className="cd-sidebar-close" onClick={() => setMenuAbierto(false)} aria-label="Cerrar">
                <Icon.close s={14} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px', marginBottom: 24 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="5.5" opacity=".55" />
                  <path d="M12 2v20M2 12h20" opacity=".22" />
                </svg>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 17, letterSpacing: '-0.02em' }}>Coach 360</span>
              </div>

              {/* Coach chooser pill */}
              <div style={{ padding: '10px 12px', background: 'var(--ink-3)', borderRadius: 12, border: '1px solid var(--line)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--ink-3)' }}>
                  <img src="/clara.jpg" alt="Clara" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Clara</div>
                  <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>tu coach</div>
                </div>
                <Icon.arrow s={12} dir="down" />
              </div>

              {/* Menú nav (6 items con dot indicator en activo) */}
              {[
                { label: 'Hoy', I: Icon.sparkle, active: view === 'inicio', action: () => navigate('inicio') },
                { label: 'Conversación', I: Icon.dots, active: false, action: () => navigate('clara') },
                { label: 'Módulos', I: Icon.book, active: false, action: () => { if (modulos[0]) { setActiveModulo(modulos[0]); navigate('modulo') } else { navigate('planes') } } },
                { label: 'Tests', I: Icon.chart, active: false, action: () => navigate('tests') },
                { label: 'Mi equilibrio', I: Icon.compass, active: false, action: () => navigate('equilibrio') },
                { label: 'Progreso', I: Icon.chart, active: false, action: () => navigate('perfil') },
              ].map((item, i) => {
                const ItemIcon = item.I
                return (
                  <button key={i} onClick={() => { item.action(); setMenuAbierto(false) }} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: 'none', borderRadius: 10,
                    background: item.active ? 'var(--v-tint)' : 'transparent',
                    color: item.active ? 'var(--text)' : 'var(--text-muted)',
                    fontSize: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)',
                  }}>
                    <ItemIcon />
                    <span>{item.label}</span>
                    {item.active && <span style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: 2, background: 'var(--v-primary)' }} />}
                  </button>
                )
              })}

              {/* Plan card — datos reales del perfil */}
              <div style={{ marginTop: 'auto', padding: 14, borderRadius: 14, background: 'var(--ink-3)', border: '1px solid var(--line)', fontSize: 12 }}>
                <div className="eyebrow" style={{ marginBottom: 6, color: 'var(--v-primary)' }}>
                  ✦ {perfil?.plan_actual === 'free' ? 'Plan Gratis' : perfil?.plan_actual === 'esencial' ? 'Plan Esencial' : 'Plan Premium'}
                </div>
                <div style={{ color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
                  {perfil?.plan_actual === 'free' ? (
                    <>Te quedan <b style={{ color: 'var(--text)' }}>{Math.max(0, 5 - (perfil?.mensajes_chat_hoy || 0))} mensajes</b> hoy.</>
                  ) : (
                    'Chat sin límite diario'
                  )}
                </div>
                <div style={{ height: 3, background: 'var(--ink-5)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${perfil?.plan_actual === 'free' ? Math.min(100, Math.round(((perfil?.mensajes_chat_hoy || 0) / 5) * 100)) : 0}%`, background: 'var(--v-primary)', transition: 'width .4s var(--ease-out)' }} />
                </div>
                {perfil?.plan_actual === 'free' && (
                  <button onClick={() => { navigate('planes'); setMenuAbierto(false) }} style={{ marginTop: 12, width: '100%', padding: '8px 10px', borderRadius: 999, border: 'none', background: 'var(--v-primary)', color: '#0a0c0e', fontSize: 12, cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                    Ir a Esencial
                  </button>
                )}
              </div>

              {/* Cerrar sesión — replicado del menú legacy eliminado */}
              <button onClick={handleLogout} style={{ marginTop: 12, padding: '10px 12px', background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', borderRadius: 10 }}>
                Cerrar sesión
              </button>
            </aside>

            {/* main */}
            <main className="cd-main">
              {/* Greeting + moment */}
              <div className="cd-hero-row">
                <div>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>
                    {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })} · día {perfil?.racha_dias || 0} ✦
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 7vw, 52px)', letterSpacing: '-0.035em', fontWeight: 400, lineHeight: 1, margin: 0 }}>
                    Buenos días, <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>{perfil?.nombre_preferido || perfil?.nombre || 'bienvenida'}</em>.
                  </h1>
                  <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.6, maxWidth: 420 }}>
                    Ayer escribiste que estabas cansada pero esperanzada. Hoy partimos desde ahí.
                  </p>
                </div>
                <div className="cd-moment">
                  <img src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&q=80&auto=format&fit=crop" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85)' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,12,14,.7), transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
                    <div className="eyebrow" style={{ marginBottom: 4, color: 'color-mix(in oklab, var(--v-primary) 90%, white)' }}>✦ Momento del día</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, lineHeight: 1.2, color: '#fff' }}>
                      Una pausa de 3 minutos.
                    </div>
                  </div>
                </div>
              </div>

              {/* Coach card */}
              <div className="cd-coach-card">
                <div className="cd-coach-img-wrap">
                  <img src={coach.photo} alt={coach.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="eyebrow" style={{ color: 'var(--v-primary)', marginBottom: 10 }}>✦ Tu coach · mujer</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 6vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6 }}>
                    {coach.name}
                  </div>
                  <div style={{ fontSize: 15, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 16 }}>
                    "Más claridad. Más poder. Más tú."
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 20, maxWidth: 520 }}>
                    Ayer terminamos hablando del miedo a decepcionar. ¿Seguimos por ahí, o llegaste con otra cosa hoy?
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 'auto', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('clara')} style={{ padding: '12px 20px', borderRadius: 999, border: 'none', background: 'var(--v-primary)', color: '#0a0c0e', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)' }}>
                      Seguir conversando →
                    </button>
                    <button onClick={() => { setChatMsgs([]); navigate('clara') }} style={{ padding: '12px 20px', borderRadius: 999, border: '1px solid var(--line-strong)', background: 'transparent', color: 'var(--text)', fontWeight: 500, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                      Empezar algo nuevo
                    </button>
                  </div>
                </div>
              </div>

              {/* Check-in + Balance */}
              <div className="cd-checkbal">
                <div style={{ padding: 22, background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, gap: 12 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>¿Cómo llegas hoy?</div>
                    <div className="eyebrow">un minuto</div>
                  </div>
                  {!checkinDone ? (
                    <>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                        {animos.map(a => (
                          <button key={a.value} onClick={() => { setAnimoHoy(a.value); setCheckinDone(true); sumarPuntos('checkin', 5, `Check-in: ${a.label}`) }} style={{
                            flex: '1 1 0', minWidth: 70, padding: '12px 8px', border: '1px solid var(--line)', borderRadius: 999, cursor: 'pointer',
                            background: animoHoy === a.value ? 'var(--v-primary)' : 'transparent',
                            color: animoHoy === a.value ? '#0a0c0e' : 'var(--text-muted)',
                            borderColor: animoHoy === a.value ? 'var(--v-primary)' : 'var(--line)',
                            fontSize: 12, fontWeight: animoHoy === a.value ? 600 : 400, textTransform: 'lowercase', fontFamily: 'var(--font-body)',
                          }}>{a.label}</button>
                        ))}
                      </div>
                      <textarea placeholder="Cuéntame en una frase... (opcional)" style={{
                        width: '100%', minHeight: 64, padding: 14, background: 'var(--ink-3)', border: '1px solid var(--line)',
                        borderRadius: 12, color: 'var(--text)', fontSize: 14, resize: 'none', fontFamily: 'var(--font-body)', outline: 'none', lineHeight: 1.5,
                      }} />
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: 'var(--v-primary)', fontFamily: 'var(--font-mono)', letterSpacing: 0.3 }}>Check-in completado ✦</div>
                  )}
                </div>

                <div onClick={() => navigate('equilibrio')} style={{ padding: 22, background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, gap: 12 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em' }}>Tu equilibrio</div>
                    <div className="eyebrow">esta semana</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { k: 'Mente', v: 7.8 }, { k: 'Cuerpo', v: 6.2 }, { k: 'Corazón', v: 8.4 }, { k: 'Espíritu', v: 5.9 },
                    ].map((b) => (
                      <div key={b.k}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                          <span style={{ fontSize: 13 }}>{b.k}</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{b.v.toFixed(1)}<span style={{ fontSize: 11, color: 'var(--text-dim)' }}>/10</span></span>
                        </div>
                        <div style={{ height: 3, background: 'var(--ink-5)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${b.v * 10}%`, background: 'var(--v-primary)', transition: 'width .4s var(--ease-out)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Community band */}
              <div style={{ padding: '20px 22px', background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)' }}>
                <div className="cd-community-inner">
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>✦ Cerca de ti</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '-0.02em' }}>Otras <em style={{ fontStyle: 'italic', color: 'var(--v-primary)' }}>142 personas</em> también están trabajando en esto hoy.</div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    {[
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&auto=format&fit=crop',
                    ].map((s, i) => (
                      <div key={i} style={{ marginLeft: i === 0 ? 0 : -12, width: 36, height: 36, borderRadius: 18, overflow: 'hidden', boxShadow: '0 0 0 3px var(--bg), 0 0 0 4px color-mix(in oklab, var(--v-primary) 50%, transparent)' }}>
                        <img src={s} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    ))}
                    <div style={{ marginLeft: -12, width: 36, height: 36, borderRadius: 18, background: 'var(--ink-4)', border: '3px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>+138</div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

      {view === 'modulo' && activeModulo && (
        <div>
          <Header title={activeModulo.titulo} subtitle={`${activeModulo.numero_semanas} semanas`} />
          <div style={{ padding: '20px' }}>
            <div className="card" style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.7, marginBottom: 16 }}>{activeModulo.descripcion}</p>
              {activeModulo.objetivo && (
                <div style={{ background: 'rgba(212,175,55,0.08)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Objetivo</p>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{activeModulo.objetivo}</p>
                </div>
              )}
              {progresoModulos?.find(p => p.modulo_id === activeModulo.id)?.porcentaje_avance > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-light)' }}>Progreso</p>
                    <p style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>{progresoModulos.find(p => p.modulo_id === activeModulo.id)?.porcentaje_avance}%</p>
                  </div>
                  <div style={{ height: 6, background: 'var(--warm-dark)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progresoModulos.find(p => p.modulo_id === activeModulo.id)?.porcentaje_avance}%`, background: 'var(--gold)', borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              )}
            </div>
            <button onClick={async () => {
              const prog = progresoModulos?.find(p => p.modulo_id === activeModulo.id)
              const nuevoPct = Math.min(100, (prog?.porcentaje_avance || 0) + 25)
              const completado = nuevoPct >= 100
              await supabase.from('progreso_modulos').upsert({ usuario_id: user.id, modulo_id: activeModulo.id, porcentaje_avance: nuevoPct, completado, fecha_completado: completado ? new Date().toISOString() : null }, { onConflict: 'usuario_id,modulo_id' })
              setProgresoModulos(prev => { const filtered = prev.filter(p => p.modulo_id !== activeModulo.id); return [...filtered, { modulo_id: activeModulo.id, porcentaje_avance: nuevoPct, completado }] })
              if (completado) { await sumarPuntos('modulo_completado', 50, `Módulo: ${activeModulo.titulo}`) }
            }} style={{ width: '100%', background: 'linear-gradient(135deg, #d4af37, #f5c842)', color: '#0a0a0a', border: 'none', padding: '16px 24px', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12 }}>
              {progresoModulos?.find(p => p.modulo_id === activeModulo.id)?.completado ? 'Módulo completado ✦' : progresoModulos?.find(p => p.modulo_id === activeModulo.id)?.porcentaje_avance > 0 ? 'Continuar módulo →' : 'Comenzar módulo →'}
            </button>
            <button onClick={() => { setChatMsgs([{ r: 'u', t: `Quiero hablar sobre el módulo "${activeModulo.titulo}". ¿Cómo me ayudas a aprovecharlo mejor?` }]); navigate('clara') }} style={{ width: '100%', background: 'transparent', border: '1px solid var(--gold-light)', color: 'var(--text)', padding: '14px 24px', borderRadius: 30, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              Hablar con Clara sobre este módulo ✦
            </button>
          </div>
        </div>
      )}

      {view === 'planes' && (
        <div>
          <Header title="Elige tu coach ✦" subtitle={pricing ? `Precios en ${pricing.pais_nombre}` : 'Cada plan te conecta con una coach diferente'} />
          <div style={{ padding: '20px' }}>
            {planes.map(p => {
              const c = coaches[p.id]
              const isCurrentPlan = plan === p.id
              const precioInfo = pricing?.precios?.[p.id]
              const precioMostrado = p.id === 'free' ? '$0' : (precioInfo?.precio_formateado || '...')
              return (
                <div key={p.id} className="card" style={{ marginBottom: 16, border: p.popular ? '2px solid var(--gold)' : isCurrentPlan ? '2px solid var(--dark)' : '2px solid transparent', position: 'relative' }}>
                  {p.popular && (<div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: '#fff', padding: '2px 16px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>Más popular</div>)}
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}><img src={c.photo} alt={c.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} /><div><h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>{c.name}</h3><p style={{ fontSize: 11, color: 'var(--gold)', marginTop: 2 }}>{c.credential}</p></div></div>
                  <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 14 }}>{c.desc}</p>
                  <div style={{ marginBottom: 14 }}>{p.features.map((f, i) => (<p key={i} style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4, paddingLeft: 16, position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: 'var(--gold)' }}>·</span>{f}</p>))}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>{precioMostrado}</span>
                      {p.id !== 'free' && <span style={{ fontSize: 13, color: 'var(--text-light)' }}>/mes</span>}
                    </div>
                    {isCurrentPlan ? (<span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>Plan actual</span>) : p.id === 'free' ? (<span style={{ fontSize: 13, color: 'var(--text-light)' }}>Gratis</span>) : (<button className="btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => handleCheckout(p.id)}>Elegir plan</button>)}
                  </div>
                </div>
              )
            })}

            {/* Sesiones humanas personales */}
            <div className="card" style={{ marginTop: 24, background: 'var(--warm-dark)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>Sesiones con coach humana</h3>
              <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 14 }}>
                Complementa tu proceso con una sesión 1:1 con una coach profesional certificada.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { id: 'sesion_personal_1', label: '1 sesión', desc: '60 minutos' },
                  { id: 'sesion_personal_4', label: 'Pack 4', desc: 'Ahorras con el pack' },
                  { id: 'sesion_personal_8', label: 'Pack 8', desc: 'Mejor valor' },
                ].map(s => {
                  const precioInfo = pricing?.precios?.[s.id]
                  return (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, background: '#fff', borderRadius: 10 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-light)' }}>{s.desc}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{precioInfo?.precio_formateado || '...'}</span>
                        <button onClick={() => handleCheckout(s.id)} style={{ fontSize: 12, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--dark)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Comprar</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTest && !testResult && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, #1a1410 0%, #0a0a0a 100%)', zIndex: 1000, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => { setActiveTest(null); setTestStep(0); setTestAnswers([]); }} style={{ background: 'transparent', border: 'none', color: '#a8a8a8', fontSize: 14, cursor: 'pointer' }}>← Salir</button>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase' }}>{testStep + 1} / {testQuestions.length}</div>
          </div>
          <div style={{ padding: '0 24px 32px' }}><div style={{ background: 'rgba(212, 175, 55, 0.15)', borderRadius: 12, height: 4, overflow: 'hidden' }}><div style={{ background: 'linear-gradient(90deg, #d4af37, #f5c842)', height: '100%', width: `${((testStep + 1) / testQuestions.length) * 100}%`, transition: 'width 0.4s ease' }} /></div></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px 40px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>{activeTest.titulo}</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, lineHeight: 1.4, marginBottom: 40, color: '#fff', textAlign: 'center', fontWeight: 300 }}>{testQuestions[testStep]?.texto}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {testQuestions[testStep]?.opciones?.map((opt, i) => (<button key={i} onClick={() => answerQuestion(testQuestions[testStep].valores[i])} style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: 14, padding: '18px 20px', color: '#fff', fontSize: 15, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', lineHeight: 1.5, fontFamily: 'inherit' }}>{opt}</button>))}
            </div>
          </div>
        </div>
      )}

      {testResult && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: testResult.nombre === 'Agua' ? 'linear-gradient(180deg, #082f49 0%, #0c4a6e 40%, #0a0a0a 100%)' : testResult.nombre === 'Tierra' ? 'linear-gradient(180deg, #1a2e05 0%, #365314 40%, #0a0a0a 100%)' : testResult.nombre === 'Fuego' ? 'linear-gradient(180deg, #431407 0%, #7c2d12 40%, #0a0a0a 100%)' : testResult.nombre === 'Aire' ? 'linear-gradient(180deg, #2e1065 0%, #4c1d95 40%, #0a0a0a 100%)' : 'linear-gradient(180deg, #1a1410 0%, #0a0a0a 100%)', zIndex: 1000, overflowY: 'auto' }}>
          <div style={{ padding: '20px 24px' }}><button onClick={() => { setTestResult(null); setActiveTest(null); }} style={{ background: 'transparent', border: 'none', color: '#a8a8a8', fontSize: 14, cursor: 'pointer' }}>← Cerrar</button></div>
          <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 24px 60px' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: testResult.color || '#d4af37', textTransform: 'uppercase', marginBottom: 12 }}>Tu elemento es</div>
              <div style={{ fontSize: 80, marginBottom: 8 }}>{testResult.icono || '✦'}</div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 44, fontWeight: 300, color: '#fff', marginBottom: 16 }}>{testResult.nombre}</h1>
              <p style={{ fontSize: 16, color: '#d4d4d4', lineHeight: 1.6, maxWidth: 440, margin: '0 auto' }}>{testResult.descLarga || testResult.desc}</p>
            </div>
            {testResult.fortalezas && (<div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 16 }}><div style={{ fontSize: 11, letterSpacing: 2, color: testResult.color, textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>✦ Tus fortalezas</div>{testResult.fortalezas.map((f, i) => (<div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, color: '#e5e5e5', fontSize: 14, lineHeight: 1.5 }}><span style={{ color: testResult.color, flexShrink: 0 }}>—</span><span>{f}</span></div>))}</div>)}
            {testResult.sombras && (<div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 16 }}><div style={{ fontSize: 11, letterSpacing: 2, color: '#a8a8a8', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>Tu sombra</div>{testResult.sombras.map((s, i) => (<div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, color: '#c4c4c4', fontSize: 14, lineHeight: 1.5 }}><span style={{ color: '#a8a8a8', flexShrink: 0 }}>—</span><span>{s}</span></div>))}</div>)}
            {testResult.recomendaciones && (<div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 16 }}><div style={{ fontSize: 11, letterSpacing: 2, color: testResult.color, textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>Para esta semana</div>{testResult.recomendaciones.map((r, i) => (<div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, color: '#e5e5e5', fontSize: 14, lineHeight: 1.5 }}><span style={{ color: testResult.color, flexShrink: 0, fontWeight: 600 }}>{i + 1}.</span><span>{r}</span></div>))}</div>)}
            {testResult.proximoPaso && (<div style={{ background: testResult.colorBg, border: `1px solid ${testResult.color}40`, borderRadius: 16, padding: 24, marginBottom: 24 }}><div style={{ fontSize: 11, letterSpacing: 2, color: testResult.color, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>✦ Tu próximo paso</div><div style={{ color: '#fff', fontSize: 15, lineHeight: 1.5 }}>{testResult.proximoPaso}</div></div>)}
            <button onClick={() => { const prompt = testResult.promptClara || `Acabo de hacer un test y mi resultado es ${testResult.nombre}.`; setChatMsgs([{ r: 'u', t: prompt }]); setTestResult(null); setActiveTest(null); setView('clara') }} style={{ width: '100%', background: `linear-gradient(135deg, ${testResult.color}, ${testResult.color}cc)`, color: '#0a0a0a', border: 'none', padding: '18px 24px', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 12, fontFamily: 'inherit' }}>Conversar con {coach.name} sobre esto →</button>
            <button onClick={() => { setTestResult(null); setActiveTest(null); }} style={{ width: '100%', background: 'transparent', color: '#a8a8a8', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: 30, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Volver al inicio</button>
          </div>
        </div>
      )}

      {activeHerramienta && view === 'herramienta_activa' && !herramientaCompletada && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, #1a1410 0%, #0a0a0a 100%)', zIndex: 1000, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => { setActiveHerramienta(null); setHerramientaStep(0); setHerramientaReflexion(''); setView('herramientas') }} style={{ background: 'transparent', border: 'none', color: '#a8a8a8', fontSize: 14, cursor: 'pointer' }}>← Salir</button>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase' }}>{herramientaStep + 1} / {(activeHerramienta.pasos?.length || 0) + 1}</div>
          </div>
          <div style={{ padding: '0 24px 32px' }}><div style={{ background: 'rgba(212, 175, 55, 0.15)', borderRadius: 12, height: 4, overflow: 'hidden' }}><div style={{ background: 'linear-gradient(90deg, #d4af37, #f5c842)', height: '100%', width: `${((herramientaStep + 1) / ((activeHerramienta.pasos?.length || 1) + 1)) * 100}%`, transition: 'width 0.4s ease' }} /></div></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px 40px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>{activeHerramienta.titulo}</div>
            {herramientaStep < (activeHerramienta.pasos?.length || 0) ? (
              <>
                {herramientaStep === 0 && activeHerramienta.descripcion && (<p style={{ fontSize: 14, color: '#a8a8a8', lineHeight: 1.6, marginBottom: 24, textAlign: 'center', fontStyle: 'italic' }}>{activeHerramienta.descripcion}</p>)}
                <div style={{ background: 'rgba(212, 175, 55, 0.06)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 16, padding: 28, marginBottom: 32 }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>Paso {herramientaStep + 1}</div>
                  <p style={{ fontSize: 17, lineHeight: 1.7, color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 300 }}>{activeHerramienta.pasos?.[herramientaStep]}</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {herramientaStep > 0 && (<button onClick={() => setHerramientaStep(herramientaStep - 1)} style={{ flex: 1, background: 'transparent', color: '#a8a8a8', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: 30, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Anterior</button>)}
                  <button onClick={() => setHerramientaStep(herramientaStep + 1)} style={{ flex: 1, background: 'linear-gradient(135deg, #d4af37, #f5c842)', color: '#0a0a0a', border: 'none', padding: '16px 24px', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{herramientaStep + 1 < (activeHerramienta.pasos?.length || 1) ? 'Siguiente →' : 'Reflexión final →'}</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ background: 'rgba(212, 175, 55, 0.06)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>✦ Tu reflexión</div>
                  <p style={{ fontSize: 16, lineHeight: 1.6, color: '#fff', marginBottom: 20, fontFamily: 'Georgia, serif', fontWeight: 300 }}>¿Qué se te abrió al hacer este ejercicio? ¿Qué notaste? ¿Qué te llevas?</p>
                  <textarea value={herramientaReflexion} onChange={(e) => setHerramientaReflexion(e.target.value)} placeholder="Escribe lo que necesites soltar..." style={{ width: '100%', minHeight: 140, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 12, padding: 16, color: '#fff', fontSize: 14, lineHeight: 1.6, fontFamily: 'inherit', resize: 'vertical' }} />
                </div>
                <button onClick={completeHerramienta} disabled={!herramientaReflexion.trim()} style={{ width: '100%', background: herramientaReflexion.trim() ? 'linear-gradient(135deg, #d4af37, #f5c842)' : 'rgba(212, 175, 55, 0.2)', color: herramientaReflexion.trim() ? '#0a0a0a' : '#a8a8a8', border: 'none', padding: '18px 24px', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: herramientaReflexion.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>Completar ✦</button>
              </>
            )}
          </div>
        </div>
      )}

      {activeHerramienta && herramientaCompletada && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, #0a0a0a 60%)', zIndex: 1000, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>✦</div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12 }}>Completaste</div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 300, color: '#fff', marginBottom: 16 }}>{activeHerramienta.titulo}</h1>
            <p style={{ fontSize: 16, color: '#d4d4d4', lineHeight: 1.6, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>Tu reflexión quedó guardada. Puedes volver a ella cuando necesites recordar este momento.</p>
            <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 6 }}>+10 puntos</div>
              <div style={{ fontSize: 13, color: '#a8a8a8' }}>Cada herramienta completada te acerca a tu siguiente nivel</div>
            </div>
            <button onClick={() => { const prompt = `Acabo de completar la herramienta "${activeHerramienta.titulo}" y mi reflexión fue: "${herramientaReflexion}". Me gustaría conversar contigo sobre lo que se me abrió.`; setChatMsgs([{ r: 'u', t: prompt }]); setActiveHerramienta(null); setHerramientaStep(0); setHerramientaReflexion(''); setHerramientaCompletada(false); setView('clara') }} style={{ width: '100%', background: 'linear-gradient(135deg, #d4af37, #f5c842)', color: '#0a0a0a', border: 'none', padding: '18px 24px', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 12, fontFamily: 'inherit' }}>Conversar con {coach.name} sobre esto →</button>
            <button onClick={() => { setActiveHerramienta(null); setHerramientaStep(0); setHerramientaReflexion(''); setHerramientaCompletada(false); setView('herramientas') }} style={{ width: '100%', background: 'transparent', color: '#a8a8a8', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px', borderRadius: 30, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Volver a herramientas</button>
          </div>
        </div>
      )}

      {view === 'equilibrio' && !activeTest && (
        <div>
          <Header title="Mi Equilibrio ✦" subtitle={habitosUsuario.length > 0 ? 'Tus hábitos de hoy' : 'Configura tu bienestar'} />

          {/* Modo configuración (primera vez o reconfigurar) */}
          {(configurandoHabitos || habitosUsuario.length === 0) && (
            <div style={{ padding: '20px' }}>
              {!configurandoHabitos && habitosUsuario.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0 30px' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 20 }}>
                    Tu bienestar se construye con hábitos propios. Elige los que quieres cultivar en cada dimensión y nosotras te acompañamos.
                  </p>
                  <button className="btn-primary" onClick={iniciarConfiguracion}>Empezar ✦</button>
                </div>
              )}

              {configurandoHabitos && (() => {
                const dim = dimensiones[configDimension]
                const seleccionados = habitosSeleccionados[dim.key] || []
                const sugerencias = habitosSugeridos[dim.key] || []
                return (
                  <div>
                    {/* Progress */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                      {dimensiones.map((d, i) => (
                        <div key={d.key} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= configDimension ? d.color : '#e0dbd4', transition: 'all 0.3s' }} />
                      ))}
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: dim.color, margin: '0 auto 8px' }} />
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 6 }}>{dim.label}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-light)' }}>¿Qué hábitos quieres cultivar?</p>
                    </div>

                    {/* Sugerencias */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      {sugerencias.map(h => {
                        const isSelected = seleccionados.find(s => s.nombre === h)
                        return (
                          <button key={h} onClick={() => toggleHabitoSeleccionado(dim.key, h)} style={{
                            padding: '10px 14px', borderRadius: 20, border: `1.5px solid ${isSelected ? dim.color : '#e0dbd4'}`,
                            background: isSelected ? `${dim.color}15` : '#fff', color: isSelected ? dim.color : 'var(--text)',
                            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: isSelected ? 600 : 400, transition: 'all 0.2s'
                          }}>
                            {isSelected && '✓ '}{h}
                          </button>
                        )
                      })}
                    </div>

                    {/* Agregar propio */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                      <input type="text" value={nuevoHabito} onChange={(e) => setNuevoHabito(e.target.value)}
                        placeholder="Agregar hábito propio..." className="input-field" style={{ flex: 1, fontSize: 13 }}
                        onKeyDown={(e) => e.key === 'Enter' && agregarHabitoPropio(dim.key)} />
                      <button onClick={() => agregarHabitoPropio(dim.key)} style={{
                        padding: '0 16px', borderRadius: 12, border: 'none', background: dim.color, color: '#fff', fontSize: 18, cursor: 'pointer'
                      }}>+</button>
                    </div>

                    {/* Días por hábito seleccionado */}
                    {seleccionados.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Tus hábitos de {dim.label.toLowerCase()}</p>
                        {seleccionados.map(h => (
                          <div key={h.nombre} className="card" style={{ marginBottom: 10, padding: 14 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{h.nombre}</p>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {diasSemana.map((d, i) => {
                                const diaNum = i + 1
                                const activo = h.dias.includes(diaNum)
                                return (
                                  <button key={i} onClick={() => toggleDiaHabito(dim.key, h.nombre, diaNum)} style={{
                                    flex: 1, height: 32, borderRadius: 8, border: 'none',
                                    background: activo ? dim.color : '#f0ebe3', color: activo ? '#fff' : 'var(--text-light)',
                                    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                                  }}>{d}</button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Navegación */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      {configDimension > 0 && (
                        <button className="btn-secondary" onClick={() => setConfigDimension(configDimension - 1)} style={{ flex: 1 }}>← Anterior</button>
                      )}
                      {configDimension < dimensiones.length - 1 ? (
                        <button className="btn-primary" onClick={() => setConfigDimension(configDimension + 1)} style={{ flex: 1 }}>Siguiente →</button>
                      ) : (
                        <button className="btn-primary" onClick={guardarHabitos} style={{ flex: 1 }}>Guardar ✦</button>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Modo tracking diario (ya configuró) */}
          {!configurandoHabitos && habitosUsuario.length > 0 && (
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20, lineHeight: 1.5 }}>
                Marca los hábitos que completaste hoy. Cada uno suma puntos a tu progreso.
              </p>

              {dimensiones.map(d => {
                const habitosDim = habitosUsuario.filter(h => h.dimension === d.key)
                if (habitosDim.length === 0) return null
                const completadosDim = habitosDim.filter(h => habitosCompletados.includes(h.id)).length
                const porcentaje = habitosDim.length > 0 ? (completadosDim / habitosDim.length) * 100 : 0

                return (
                  <div key={d.key} className="card" style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.color }} />
                        <p style={{ fontWeight: 600, fontSize: 15 }}>{d.label}</p>
                      </div>
                      <p style={{ fontSize: 12, color: d.color, fontWeight: 600 }}>{completadosDim}/{habitosDim.length}</p>
                    </div>
                    <div style={{ background: '#f0ebe3', borderRadius: 12, height: 6, marginBottom: 12, overflow: 'hidden' }}>
                      <div style={{ background: d.color, height: '100%', width: `${porcentaje}%`, transition: 'width 0.4s ease' }} />
                    </div>
                    {habitosDim.map(h => {
                      const completado = habitosCompletados.includes(h.id)
                      return (
                        <button key={h.id} onClick={() => toggleHabitoCompletado(h.id)} style={{
                          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                          padding: '10px 12px', marginBottom: 6, borderRadius: 10,
                          background: completado ? `${d.color}12` : 'transparent',
                          border: `1px solid ${completado ? d.color + '40' : '#e0dbd4'}`,
                          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s'
                        }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%',
                            border: `2px solid ${completado ? d.color : '#c0b8ab'}`,
                            background: completado ? d.color : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0
                          }}>{completado && '✓'}</div>
                          <span style={{ fontSize: 14, color: completado ? d.color : 'var(--text)', fontWeight: completado ? 600 : 400, textDecoration: completado ? 'line-through' : 'none' }}>
                            {h.nombre}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}

              <button onClick={iniciarConfiguracion} style={{
                width: '100%', background: 'transparent', color: 'var(--gold)', border: '1px dashed var(--gold)',
                padding: '12px', borderRadius: 12, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginTop: 16
              }}>
                + Reconfigurar mis hábitos
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'clara' && !activeTest && (
        <div className="dir-ritual" data-v="clara" style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
          <style>{`
            @keyframes chatTypingDot { 0%,60%,100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
            .ch-wrap { display: flex; flex-direction: column; min-height: 100vh; }
            .ch-sidebar, .ch-context { display: none; }
            .ch-sidebar.open { display: flex; flex-direction: column; gap: 4px; position: fixed; top: 0; left: 0; bottom: 0; width: 280px; max-width: 85vw; z-index: 50; padding: 24px 18px; background: var(--ink-2); overflow-y: auto; box-shadow: 0 0 40px rgba(0,0,0,0.6); }
            .ch-context.open { display: flex; flex-direction: column; gap: 20px; position: fixed; top: 0; right: 0; bottom: 0; width: 320px; max-width: 85vw; z-index: 50; padding: 28px 22px; background: var(--ink-2); overflow-y: auto; box-shadow: 0 0 40px rgba(0,0,0,0.6); }
            .ch-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 40; }
            .ch-hamburger { position: fixed; top: 20px; left: 20px; z-index: 45; width: 40px; height: 40px; border-radius: 999px; background: var(--ink-3); border: 1px solid var(--line); color: var(--text); cursor: pointer; display: flex; align-items: center; justify-content: center; }
            .ch-sidebar-close, .ch-context-close { position: absolute; top: 18px; width: 32px; height: 32px; border-radius: 999px; background: transparent; border: 1px solid var(--line); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 1; }
            .ch-sidebar-close { right: 18px; }
            .ch-context-close { right: 18px; }
            .ch-main { display: flex; flex-direction: column; height: 100vh; min-height: 0; }
            .ch-header { padding: 16px 20px 14px; padding-top: 72px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
            .ch-back { display: flex; }
            .ch-header-actions { display: none; }
            .ch-messages { flex: 1; padding: 20px 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 18px; }
            .ch-input-wrap { padding: 12px 16px 20px; border-top: 1px solid var(--line); }
            @media (min-width: 768px) {
              .ch-wrap { display: grid; grid-template-columns: 260px 1fr 300px; height: 100vh; }
              .ch-sidebar, .ch-sidebar.open { display: flex; flex-direction: column; gap: 4px; position: static; padding: 24px 18px; border-right: 1px solid var(--line); background: var(--ink-2); box-shadow: none; max-width: none; width: auto; z-index: auto; top: auto; left: auto; bottom: auto; overflow-y: auto; }
              .ch-context, .ch-context.open { display: flex; flex-direction: column; gap: 20px; position: static; padding: 28px 22px; border-left: 1px solid var(--line); background: var(--ink-2); box-shadow: none; max-width: none; width: auto; z-index: auto; top: auto; right: auto; bottom: auto; overflow-y: auto; }
              .ch-backdrop, .ch-hamburger, .ch-sidebar-close, .ch-context-close { display: none; }
              .ch-main { height: auto; }
              .ch-header { padding: 20px 28px; padding-top: 20px; }
              .ch-back { display: none; }
              .ch-header-actions { display: flex; gap: 8px; }
              .ch-messages { padding: 32px 64px; }
              .ch-input-wrap { padding: 16px 28px 24px; }
            }
          `}</style>

          <button className="ch-hamburger" onClick={() => setChatSidebarAbierto(true)} aria-label="Historial">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          {(chatSidebarAbierto || contextoAbierto) && (
            <div className="ch-backdrop" onClick={() => { setChatSidebarAbierto(false); setContextoAbierto(false); }} />
          )}

          <div className="ch-wrap">
            {/* Columna 1: Sidebar — historial real de conversaciones_clara */}
            <aside className={`ch-sidebar ${chatSidebarAbierto ? 'open' : ''}`}>
              <button className="ch-sidebar-close" onClick={() => setChatSidebarAbierto(false)} aria-label="Cerrar">
                <Icon.close s={14} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px', marginBottom: 18 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="5.5" opacity=".55" />
                  <path d="M12 2v20M2 12h20" opacity=".22" />
                </svg>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16 }}>Coach 360</span>
              </div>

              <button onClick={nuevaConversacion} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--line-strong)', borderRadius: 10, background: 'transparent', color: 'var(--text)', fontSize: 13, cursor: 'pointer', marginBottom: 18, justifyContent: 'flex-start', fontFamily: 'var(--font-body)' }}>
                <span style={{ color: 'var(--v-primary)' }}>✦</span> Nueva conversación
              </button>

              {(() => {
                const g = agruparConvs(conversaciones)
                const seccion = (titulo, items) => items.length > 0 && (
                  <>
                    <div className="eyebrow" style={{ marginBottom: 8, padding: '0 10px', marginTop: titulo === 'Hoy' ? 0 : 14 }}>{titulo}</div>
                    {items.map(conv => {
                      const isActive = conv.id === conversacionActiva
                      const when = new Date(conv.ultimo_mensaje).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                      return (
                        <button key={conv.id} onClick={() => abrirConversacion(conv.id)} style={{
                          display: 'block', padding: '10px 12px', border: 'none',
                          background: isActive ? 'var(--v-tint)' : 'transparent',
                          borderRadius: 8, textAlign: 'left', cursor: 'pointer', color: 'var(--text)', fontSize: 13, lineHeight: 1.3, marginBottom: 2, width: '100%', fontFamily: 'var(--font-body)',
                        }}>
                          <div style={{ fontWeight: isActive ? 500 : 400, marginBottom: 2, color: isActive ? 'var(--text)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.titulo || 'Sin título'}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{when}</div>
                        </button>
                      )
                    })}
                  </>
                )
                return (
                  <>
                    {seccion('Hoy', g.hoy)}
                    {seccion('Esta semana', g.semana)}
                    {seccion('Anterior', g.anterior)}
                    {conversaciones.length === 0 && (
                      <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        Aún no tienes conversaciones.
                      </div>
                    )}
                  </>
                )
              })()}

              {/* Plan card (mismo mapeo que el dashboard sidebar) */}
              <div style={{ marginTop: 'auto', padding: 12, background: 'var(--ink-3)', border: '1px solid var(--line)', borderRadius: 12 }}>
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  {perfil?.plan_actual === 'free' ? 'Plan Gratis' : perfil?.plan_actual === 'esencial' ? 'Plan Esencial' : 'Plan Premium'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {perfil?.plan_actual === 'free' ? 'Mensajes hoy' : 'Mensajes este mes'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>{perfil?.mensajes_chat_hoy || 0}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>/ {perfil?.plan_actual === 'free' ? 5 : 400}</span>
                </div>
                <div style={{ height: 3, background: 'var(--ink-5)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, Math.round(((perfil?.mensajes_chat_hoy || 0) / (perfil?.plan_actual === 'free' ? 5 : 400)) * 100))}%`, background: 'var(--v-primary)', transition: 'width .4s var(--ease-out)' }} />
                </div>
              </div>
            </aside>

            {/* Columna 2: Chat central */}
            <section className="ch-main">
              <div className="ch-header">
                <button className="ch-back" onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 4px', display: 'flex', alignItems: 'center' }} aria-label="Volver">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div onClick={() => setContextoAbierto(true)} style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', boxShadow: '0 0 0 3px var(--bg), 0 0 0 4px color-mix(in oklab, var(--v-primary) 50%, transparent)' }}>
                  <img src="/clara.jpg" alt="Clara" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '-0.02em' }}>Clara</span>
                    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 999, background: 'var(--v-tint)', color: 'var(--v-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '.08em' }}>COACH · ICF</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--success)' }} />
                    Escuchando · mujer
                  </div>
                </div>
                <div className="ch-header-actions">
                  <button style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid var(--line)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Resumen</button>
                  <button style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid var(--line)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>✦ Guardar</button>
                </div>
              </div>

              <div className="ch-messages">
                <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '.1em', marginBottom: 8, textTransform: 'uppercase' }}>
                  {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>

                {chatMsgs.map((m, i) => {
                  const esPrimerMsgCoach = m.r === 'a' && !chatMsgs.slice(0, i).some(p => p.r === 'a')
                  const hora = m.createdAt ? new Date(m.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : ''
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12, flexDirection: m.r === 'u' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                      {m.r === 'a' && (
                        <img src="/clara.jpg" alt="Clara" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div style={{
                        maxWidth: 520,
                        padding: '14px 18px',
                        borderRadius: m.r === 'u' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: m.r === 'u' ? 'var(--ink-5)' : (esPrimerMsgCoach ? 'var(--v-tint)' : 'var(--ink-2)'),
                        color: 'var(--text)',
                        border: esPrimerMsgCoach ? '1px solid color-mix(in oklab, var(--v-primary) 30%, transparent)' : '1px solid var(--line)',
                        fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                      }}>
                        {esPrimerMsgCoach && (
                          <div className="eyebrow" style={{ color: 'var(--v-primary)', marginBottom: 8 }}>✦ Clara recuerda</div>
                        )}
                        {m.t}
                        {hora && (
                          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 6, fontFamily: 'var(--font-mono)', textAlign: m.r === 'u' ? 'right' : 'left' }}>{hora}</div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {typing && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                    <img src="/clara.jpg" alt="Clara" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ padding: '14px 18px', background: 'var(--ink-2)', borderRadius: '18px 18px 18px 4px', border: '1px solid var(--line)', display: 'flex', gap: 4 }}>
                      {[0,1,2].map(i => (
                        <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--text-muted)', animation: `chatTypingDot 1.4s ${i * 0.2}s infinite ease-in-out` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="ch-input-wrap">
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '10px 14px', background: 'var(--ink-2)', border: '1px solid var(--line-strong)', borderRadius: 20 }}>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    aria-label={isRecording ? 'Detener grabación' : 'Grabar audio'}
                    style={{ width: 32, height: 32, borderRadius: 16, border: 'none', background: isRecording ? 'color-mix(in oklab, var(--danger) 18%, transparent)' : 'transparent', color: isRecording ? 'var(--danger)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    {isRecording ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></svg>
                    )}
                  </button>
                  <textarea
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder={`Escríbele a Clara...`}
                    rows={1}
                    style={{ flex: 1, minHeight: 24, maxHeight: 120, background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 15, lineHeight: 1.5, outline: 'none', resize: 'none', fontFamily: 'var(--font-body)', padding: '4px 0' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!chatInput.trim()}
                    aria-label="Enviar"
                    style={{ width: 36, height: 36, borderRadius: 18, border: 'none', background: chatInput.trim() ? 'var(--v-primary)' : 'var(--ink-4)', color: chatInput.trim() ? '#0a0c0e' : 'var(--text-dim)', cursor: chatInput.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <Icon.arrow s={14} />
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textAlign: 'center', marginTop: 10, letterSpacing: '.05em' }}>
                  Enter para enviar · Shift+Enter para línea nueva · todo queda cifrado
                </div>
              </div>
            </section>

            {/* Columna 3: Panel contexto (hardcoded placeholder) */}
            <aside className={`ch-context ${contextoAbierto ? 'open' : ''}`}>
              <button className="ch-context-close" onClick={() => setContextoAbierto(false)} aria-label="Cerrar">
                <Icon.close s={14} />
              </button>

              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>✦ Clara recuerda</div>
                <div style={{ padding: 14, background: 'var(--ink-3)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 13, lineHeight: 1.55 }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: 11, fontFamily: 'var(--font-mono)' }}>Del lunes</div>
                  Pedirle a Nicolás una reunión uno-a-uno para hablar del proyecto.
                  <button style={{ marginTop: 10, padding: '6px 10px', fontSize: 11, borderRadius: 999, border: '1px solid var(--line-strong)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>✓ Marcar hecho</button>
                </div>
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Tu estado ahora</div>
                <div style={{ padding: 14, background: 'var(--ink-3)', border: '1px solid var(--line)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span>Ansiedad</span><span>moderada</span>
                  </div>
                  <div style={{ height: 3, background: 'var(--ink-5)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '62%', background: 'var(--v-primary)', transition: 'width .4s var(--ease-out)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', margin: '12px 0 8px' }}>
                    <span>Claridad</span><span>media</span>
                  </div>
                  <div style={{ height: 3, background: 'var(--ink-5)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '48%', background: 'var(--v-primary)', transition: 'width .4s var(--ease-out)' }} />
                  </div>
                </div>
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Sugeridos</div>
                {[
                  { t: 'Ejercicio de respiración', sub: '3 min · sugerido por Clara' },
                  { t: 'Módulo: ordenar el día', sub: '12 min · autoconocimiento' },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: 'var(--ink-3)', border: '1px solid var(--line)', borderRadius: 12, marginBottom: 8, cursor: 'pointer' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{s.t}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              <button style={{ marginTop: 'auto', padding: 12, borderRadius: 12, border: '1px dashed var(--line-strong)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                ✦ Agendar sesión humana 1:1
              </button>
            </aside>
          </div>
        </div>
      )}

      {view === 'tests' && !activeTest && (
        <div>
          <Header title="Tests ✦" subtitle="Descubre más sobre ti misma" showBack={false} />
          <div style={{ padding: '20px' }}>
            {tests.map(t => (<div key={t.id} className="card" style={{ marginBottom: 10, cursor: canAccess(t.plan_requerido) ? 'pointer' : 'default' }} onClick={() => canAccess(t.plan_requerido) && startTest(t)}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.titulo}</p><p style={{ fontSize: 12, color: 'var(--text-light)' }}>{t.numero_preguntas} preguntas · {t.categoria}</p></div>{!canAccess(t.plan_requerido) ? (<span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>) : <span style={{ fontSize: 14, color: 'var(--gold)' }}>→</span>}</div></div>))}
          </div>
        </div>
      )}

      {view === 'herramientas' && !activeHerramienta && (
        <div>
          <Header title="Herramientas ✦" subtitle="Ejercicios prácticos con neurociencia" showBack={false} />
          <div style={{ padding: '20px' }}>
            {herramientas.map(h => (<div key={h.id} className="card" style={{ marginBottom: 10, cursor: canAccess(h.plan_requerido) ? 'pointer' : 'default' }} onClick={() => { if (canAccess(h.plan_requerido)) { startHerramienta(h) } }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{h.titulo}</p><p style={{ fontSize: 12, color: 'var(--text-light)' }}>{h.categoria} · {h.pasos?.length || 0} pasos</p></div>{!canAccess(h.plan_requerido) ? (<span style={{ fontSize: 11, background: 'var(--warm-dark)', padding: '4px 10px', borderRadius: 8, color: 'var(--text-light)' }}>Premium</span>) : <span style={{ fontSize: 14, color: 'var(--gold)' }}>→</span>}</div></div>))}
          </div>
        </div>
      )}

      {view === 'perfil' && !activeTest && (
        <div>
          <Header title="Tu Perfil ✦" showBack={false} />
          <div style={{ padding: '20px' }}>
            <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontFamily: 'var(--font-display)', margin: '0 auto 12px' }}>{nombre[0].toUpperCase()}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{nombre}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>{user?.email}</p>
              <p style={{ display: 'inline-block', marginTop: 8, fontSize: 12, background: 'var(--warm-dark)', padding: '4px 12px', borderRadius: 8, color: 'var(--gold)', fontWeight: 600, textTransform: 'capitalize' }}>Plan {plan}</p>
            </div>
            <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
              <img src={coach.photo} alt={coach.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              <div><p style={{ fontWeight: 600, fontSize: 14 }}>Tu coach: {coach.name}</p><p style={{ fontSize: 12, color: 'var(--text-light)' }}>{coach.credential}</p></div>
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[{ label: 'Racha actual', val: perfil?.racha_dias || 0 }, { label: 'Mejor racha', val: perfil?.mejor_racha || 0 }, { label: 'Nivel', val: perfil?.nivel || 1 }, { label: 'Puntos', val: perfil?.puntos_totales || 0 }].map(s => (<div key={s.label} style={{ textAlign: 'center' }}><p style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>{s.val}</p><p style={{ fontSize: 12, color: 'var(--text-light)' }}>{s.label}</p></div>))}
              </div>
            </div>
            <button className="btn-primary" onClick={() => navigate('planes')} style={{ marginBottom: 12 }}>Cambiar plan</button>
            <button className="btn-secondary" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {/* === MODAL STATS INTERACTIVAS === */}
      {statModal && (() => {
        const racha = perfil?.racha_dias || 0
        const mejorRacha = perfil?.mejor_racha || 0
        const nivel = perfil?.nivel || 1
        const puntos = perfil?.puntos_totales || 0
        const niveles = [
          { n: 1, nombre: 'Exploradora', min: 0, max: 100 },
          { n: 2, nombre: 'Buscadora', min: 100, max: 300 },
          { n: 3, nombre: 'Descubridora', min: 300, max: 600 },
          { n: 4, nombre: 'Reveladora', min: 600, max: 1000 },
          { n: 5, nombre: 'Transformadora', min: 1000, max: 1500 },
          { n: 6, nombre: 'Creadora', min: 1500, max: 2200 },
          { n: 7, nombre: 'Guía', min: 2200, max: 3000 },
          { n: 8, nombre: 'Maestra', min: 3000, max: Infinity },
        ]
        const nivelActual = niveles[Math.min(nivel - 1, niveles.length - 1)]
        const siguienteNivel = niveles[Math.min(nivel, niveles.length - 1)]
        const progresoNivel = nivelActual.max === Infinity ? 100 : ((puntos - nivelActual.min) / (nivelActual.max - nivelActual.min)) * 100

        return (
          <div onClick={() => setStatModal(null)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex',
            alignItems: 'flex-end', justifyContent: 'center',
          }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: 'linear-gradient(180deg, #1a1410 0%, #0a0a0a 100%)',
              borderTopLeftRadius: 28, borderTopRightRadius: 28,
              width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto',
              padding: '24px 24px 40px', border: '1px solid rgba(212, 175, 55, 0.25)',
              borderBottom: 'none',
            }}>
              <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 4, margin: '0 auto 24px' }} />

              {statModal === 'racha' && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12 }}>Tu racha</div>
                    <div style={{ fontSize: 72, fontFamily: 'Georgia, serif', fontWeight: 300, color: '#d4af37', lineHeight: 1 }}>{racha}</div>
                    <div style={{ fontSize: 14, color: '#a8a8a8', marginTop: 4 }}>días consecutivos</div>
                  </div>

                  <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>Tu mejor racha</div>
                    <div style={{ fontSize: 28, color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 300 }}>{mejorRacha} días</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>Rachas que puedes completar</div>
                    {[
                      { dias: 3, nombre: 'Primer impulso', completado: racha >= 3 },
                      { dias: 7, nombre: 'Una semana', completado: racha >= 7 },
                      { dias: 14, nombre: 'Consistencia', completado: racha >= 14 },
                      { dias: 30, nombre: 'Un mes entero', completado: racha >= 30 },
                      { dias: 60, nombre: 'Transformación', completado: racha >= 60 },
                      { dias: 100, nombre: 'Leyenda', completado: racha >= 100 },
                    ].map(r => (
                      <div key={r.dias} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            border: `2px solid ${r.completado ? '#d4af37' : 'rgba(255,255,255,0.2)'}`,
                            background: r.completado ? '#d4af37' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: r.completado ? '#0a0a0a' : '#666', fontSize: 12, fontWeight: 700,
                          }}>{r.completado ? '✓' : r.dias}</div>
                          <span style={{ color: r.completado ? '#fff' : '#a8a8a8', fontSize: 14 }}>{r.nombre}</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#666' }}>{r.dias} días</span>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, textAlign: 'center', marginTop: 16 }}>
                    Tu racha crece cada día que haces check-in, completas un hábito, una herramienta o conversas con tu coach.
                  </p>
                </>
              )}

              {statModal === 'nivel' && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12 }}>Tu nivel</div>
                    <div style={{ fontSize: 72, fontFamily: 'Georgia, serif', fontWeight: 300, color: '#d4af37', lineHeight: 1 }}>{nivel}</div>
                    <div style={{ fontSize: 18, color: '#fff', marginTop: 8, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>{nivelActual.nombre}</div>
                  </div>

                  {nivelActual.max !== Infinity && (
                    <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: '#a8a8a8' }}>Progreso al siguiente nivel</span>
                        <span style={{ fontSize: 12, color: '#d4af37', fontWeight: 600 }}>{puntos} / {nivelActual.max}</span>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, height: 8, overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(90deg, #d4af37, #f5c842)', height: '100%', width: `${Math.min(progresoNivel, 100)}%`, transition: 'width 0.5s' }} />
                      </div>
                      <p style={{ fontSize: 12, color: '#a8a8a8', marginTop: 12, lineHeight: 1.5 }}>
                        Te faltan <strong style={{ color: '#d4af37' }}>{nivelActual.max - puntos} puntos</strong> para ser <em style={{ color: '#fff' }}>{siguienteNivel.nombre}</em>
                      </p>
                    </div>
                  )}

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>Todos los niveles</div>
                    {niveles.map(n => (
                      <div key={n.n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: n.n <= nivel ? 1 : 0.5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: n.n <= nivel ? '#d4af37' : 'rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: n.n <= nivel ? '#0a0a0a' : '#666', fontSize: 12, fontWeight: 700,
                          }}>{n.n}</div>
                          <span style={{ color: '#fff', fontSize: 14, fontStyle: n.n === nivel ? 'italic' : 'normal' }}>{n.nombre}</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#666' }}>{n.min}{n.max !== Infinity ? `-${n.max}` : '+'} pts</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {statModal === 'puntos' && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12 }}>Tus puntos</div>
                    <div style={{ fontSize: 72, fontFamily: 'Georgia, serif', fontWeight: 300, color: '#d4af37', lineHeight: 1 }}>{puntos}</div>
                    <div style={{ fontSize: 14, color: '#a8a8a8', marginTop: 4 }}>puntos totales</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>Cómo ganar puntos</div>
                    {[
                      { accion: 'Check-in diario', puntos: 5 },
                      { accion: 'Completar un hábito', puntos: 3 },
                      { accion: 'Hacer un test', puntos: 20 },
                      { accion: 'Completar una herramienta', puntos: 15 },
                      { accion: 'Conversar con tu coach', puntos: 5 },
                      { accion: 'Completar una lección de módulo', puntos: 10 },
                      { accion: 'Racha de 7 días', puntos: 30 },
                      { accion: 'Racha de 30 días', puntos: 100 },
                    ].map(a => (
                      <div key={a.accion} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#e5e5e5', fontSize: 14 }}>{a.accion}</span>
                        <span style={{ color: '#d4af37', fontSize: 13, fontWeight: 600 }}>+{a.puntos}</span>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6, textAlign: 'center', marginTop: 16 }}>
                    Los puntos reflejan tu compromiso contigo misma. No compiten con nadie — solo contigo misma.
                  </p>
                </>
              )}

              <button onClick={() => setStatModal(null)} style={{
                width: '100%', background: 'transparent', color: '#a8a8a8',
                border: '1px solid rgba(255,255,255,0.15)', padding: '14px 24px',
                borderRadius: 30, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                marginTop: 20,
              }}>Cerrar</button>
            </div>
          </div>
        )
      })()}

      {!activeTest && !testResult && !activeHerramienta && !['clara', 'equilibrio', 'herramienta_activa', 'planes'].includes(view) && (
        <div className="dir-ritual" data-v="clara">
          <style>{`
            .bnav {
              position: fixed; bottom: 0; left: 0; right: 0;
              background: var(--ink-2);
              border-top: 1px solid var(--line);
              display: flex; justify-content: space-around;
              padding: 8px 4px calc(20px + env(safe-area-inset-bottom)) 4px;
              z-index: 100;
            }
            .bnav-item {
              flex: 1 1 0; min-width: 0;
              display: flex; flex-direction: column; align-items: center; gap: 3px;
              background: none; border: none; cursor: pointer;
              color: var(--text-muted);
              font-size: 10px; font-family: var(--font-body);
              padding: 4px 2px;
              overflow: hidden;
              transition: color var(--d-fast) var(--ease-out);
            }
            .bnav-item.active { color: var(--v-primary); }
            .bnav-label {
              max-width: 100%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            @media (min-width: 768px) { .bnav { display: none; } }
          `}</style>
          <div className="bnav">
            {[
              { label: 'Hoy',        I: Icon.sparkle, active: view === 'inicio',      action: () => setView('inicio') },
              { label: 'Clara',      I: Icon.dots,    active: view === 'clara',       action: () => navigate('clara') },
              { label: 'Módulos',    I: Icon.book,    active: view === 'modulo',      action: () => { if (modulos[0]) { setActiveModulo(modulos[0]); navigate('modulo') } else { navigate('planes') } } },
              { label: 'Tests',      I: Icon.chart,   active: view === 'tests',       action: () => setView('tests') },
              { label: 'Equilibrio', I: Icon.compass, active: view === 'equilibrio',  action: () => navigate('equilibrio') },
              { label: 'Progreso',   I: Icon.chart,   active: view === 'perfil',      action: () => navigate('perfil') },
            ].map((item, i) => {
              const ItemIcon = item.I
              return (
                <button key={i} onClick={item.action} className={`bnav-item ${item.active ? 'active' : ''}`} aria-label={item.label}>
                  <ItemIcon s={18} />
                  <span className="bnav-label">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
