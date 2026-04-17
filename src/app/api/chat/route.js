export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'


const momentosLabels = {
  transicion: 'en un momento de cambio o transición',
  crecimiento: 'buscando crecer profesionalmente',
  equilibrio: 'buscando más equilibrio y bienestar',
  relaciones: 'trabajando en sus relaciones',
  reconexion: 'queriendo reconectarse consigo misma',
  empezar: 'empezando algo nuevo',
}

const identidadLabels = {
  mama: 'mamá',
  emprendedora: 'emprendedora',
  corporativa: 'trabaja en entorno corporativo',
  lidera: 'lidera equipos',
  minoria: 'es minoría en su industria',
  proposito: 'busca propósito',
  transicion_rel: 'saliendo de una relación o etapa',
}

const focoLabels = {
  estres: 'manejar mejor su estrés y ansiedad',
  relaciones: 'mejorar sus relaciones y vínculos',
  proposito: 'encontrar más propósito y sentido',
  confianza: 'fortalecer su confianza y autoestima',
  cambio: 'navegar un cambio o transición',
  liderazgo: 'desarrollar su liderazgo',
}

async function construirMemoriaCompleta(userId, esPremium) {
  if (!userId) return ''
  try {
    // 1. Perfil base
    const { data: perfil } = await supabaseAdmin
      .from('perfiles')
      .select('nombre, racha_dias, mejor_racha, nivel, puntos_totales')
      .eq('id', userId).single()

    // 2. Onboarding
    const { data: onboarding } = await supabaseAdmin
      .from('onboarding_respuestas')
      .select('*')
      .eq('user_id', userId)
      .eq('vertical', 'mujer')
      .maybeSingle()

    // 3. Todos los resultados de tests
    const { data: tests } = await supabaseAdmin
      .from('resultados_test')
      .select('perfil_resultado, puntaje_total, fecha_realizacion, test_id')
      .eq('usuario_id', userId)
      .order('fecha_realizacion', { ascending: false })
      .limit(20)

    // 4. Nombres de tests
    const { data: testsCatalogo } = await supabaseAdmin
      .from('tests')
      .select('id, titulo')
      .eq('vertical', 'mujer')

    const testsMap = {}
    testsCatalogo?.forEach(t => { testsMap[t.id] = t.titulo })

    // 5. Hábitos configurados y cumplimiento esta semana
    const { data: habitos } = await supabaseAdmin
      .from('habitos_usuario')
      .select('id, dimension, nombre')
      .eq('user_id', userId)
      .eq('activo', true)

    const hace7dias = new Date()
    hace7dias.setDate(hace7dias.getDate() - 7)
    const { data: habitosCompletados } = await supabaseAdmin
      .from('habitos_completados')
      .select('habito_id, fecha')
      .eq('user_id', userId)
      .gte('fecha', hace7dias.toISOString().split('T')[0])

    // 6. Check-ins últimos 7 días
    const { data: checkins } = await supabaseAdmin
      .from('daily_checkins')
      .select('mood, energy, clarity, created_at')
      .eq('user_id', userId)
      .eq('vertical', 'mujer')
      .gte('created_at', hace7dias.toISOString())
      .order('created_at', { ascending: false })

    // 7. Progreso en módulos
    const { data: progreso } = await supabaseAdmin
      .from('progreso_modulos')
      .select('modulo_id, porcentaje_avance, completado, fecha_completado')
      .eq('usuario_id', userId)

    const { data: modulosCatalogo } = await supabaseAdmin
      .from('modulos')
      .select('id, titulo')
      .eq('vertical', 'mujer')

    const modulosMap = {}
    modulosCatalogo?.forEach(m => { modulosMap[m.id] = m.titulo })

    // 8. Insights y compromisos guardados
    const { data: contextos } = await supabaseAdmin
      .from('user_context')
      .select('context_key, context_value, created_at, source_coach')
      .eq('user_id', userId)
      .eq('vertical', 'mujer')
      .order('created_at', { ascending: false })
      .limit(20)

    // 9. Memoria cruzada (solo Premium)
    let crossContext = []
    if (esPremium) {
      const { data } = await supabaseAdmin
        .from('user_context')
        .select('vertical, context_value, source_coach, created_at')
        .eq('user_id', userId)
        .neq('vertical', 'mujer')
        .eq('cross_coach', true)
        .order('created_at', { ascending: false })
        .limit(10)
      crossContext = data || []
    }

    // ── CONSTRUIR CONTEXTO ──
    let ctx = '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nMEMORIA DE COACHING — LEE ESTO ANTES DE RESPONDER\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'

    // Perfil
    if (perfil?.nombre) ctx += `\n👤 PERSONA: ${perfil.nombre}`
    if (perfil) ctx += ` | Racha: ${perfil.racha_dias || 0} días | Nivel ${perfil.nivel || 1} | ${perfil.puntos_totales || 0} pts`

    // Onboarding
    if (onboarding) {
      ctx += '\n\n📋 PERFIL DE INICIO:'
      if (onboarding.momento_vida?.length > 0) {
        const momentos = onboarding.momento_vida.map(m => momentosLabels[m]).filter(Boolean).join(' y ')
        if (momentos) ctx += `\n• Momento de vida: está ${momentos}`
      }
      if (onboarding.identidad?.length > 0) {
        const ids = onboarding.identidad.map(i => identidadLabels[i]).filter(Boolean).join(', ')
        if (ids) ctx += `\n• Se identifica como: ${ids}`
      }
      if (onboarding.foco_inicial) {
        const foco = focoLabels[onboarding.foco_inicial]
        if (foco) ctx += `\n• Quiere trabajar en: ${foco}`
      }
      if (onboarding.respuesta_libre) ctx += `\n• Lo que quiere diferente en 90 días: "${onboarding.respuesta_libre}"`
      if (onboarding.bienestar_inicial) {
        const b = onboarding.bienestar_inicial
        ctx += `\n• Bienestar inicial: Mente ${b.mente}/10, Cuerpo ${b.cuerpo}/10, Corazón ${b.corazon}/10, Espíritu ${b.espiritu}/10`
      }
    }

    // Tests
    if (tests?.length > 0) {
      const testsFiltrados = tests.filter(t => t.perfil_resultado && !t.perfil_resultado.startsWith('Herramienta:'))
      if (testsFiltrados.length > 0) {
        ctx += '\n\n🧪 RESULTADOS DE TESTS:'
        testsFiltrados.forEach(t => {
          const titulo = testsMap[t.test_id] || 'Test'
          const fecha = t.fecha_realizacion ? new Date(t.fecha_realizacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : ''
          ctx += `\n• ${titulo}: "${t.perfil_resultado}"${fecha ? ` (${fecha})` : ''}`
        })
      }
      // Herramientas completadas
      const herramientas = tests.filter(t => t.perfil_resultado?.startsWith('Herramienta:'))
      if (herramientas.length > 0) {
        ctx += '\n\n🛠 HERRAMIENTAS COMPLETADAS:'
        herramientas.slice(0, 5).forEach(h => {
          const nombre = h.perfil_resultado.replace('Herramienta: ', '')
          ctx += `\n• ${nombre}`
        })
      }
    }

    // Hábitos
    if (habitos?.length > 0) {
      ctx += '\n\n💚 HÁBITOS CONFIGURADOS:'
      const completadosIds = new Set(habitosCompletados?.map(h => h.habito_id) || [])
      const porDim = {}
      habitos.forEach(h => {
        if (!porDim[h.dimension]) porDim[h.dimension] = []
        porDim[h.dimension].push(h)
      })
      Object.entries(porDim).forEach(([dim, arr]) => {
        const completados = arr.filter(h => completadosIds.has(h.id)).length
        ctx += `\n• ${dim}: ${arr.map(h => h.nombre).join(', ')} (${completados}/${arr.length} esta semana)`
      })
    }

    // Check-ins
    if (checkins?.length > 0) {
      const promedioMood = Math.round(checkins.reduce((a, c) => a + (c.mood || 0), 0) / checkins.length)
      const promedioEnergy = Math.round(checkins.reduce((a, c) => a + (c.energy || 0), 0) / checkins.length)
      const promedioClarity = Math.round(checkins.reduce((a, c) => a + (c.clarity || 0), 0) / checkins.length)
      const moodLabel = promedioMood <= 2 ? 'difícil' : promedioMood <= 3 ? 'regular' : promedioMood <= 4 ? 'bien' : 'muy bien'
      ctx += `\n\n📊 ESTADO ESTA SEMANA (${checkins.length} check-ins):`
      ctx += `\n• Ánimo promedio: ${promedioMood}/5 (${moodLabel})`
      if (promedioEnergy) ctx += ` | Energía: ${promedioEnergy}/5`
      if (promedioClarity) ctx += ` | Claridad: ${promedioClarity}/5`
    }

    // Progreso módulos
    if (progreso?.length > 0) {
      ctx += '\n\n📚 PROGRESO EN MÓDULOS:'
      progreso.forEach(p => {
        const titulo = modulosMap[p.modulo_id] || 'Módulo'
        if (p.completado) {
          ctx += `\n• ✓ ${titulo} — completado`
        } else if (p.porcentaje_avance > 0) {
          ctx += `\n• ${titulo} — ${p.porcentaje_avance}% avanzado`
        }
      })
    }

    // Insights y compromisos de conversaciones anteriores
    if (contextos?.length > 0) {
      const insights = contextos.filter(c => c.context_key === 'insight_conversacion')
      const compromisos = contextos.filter(c => c.context_key === 'compromiso_pendiente')
      const ultimoTest = contextos.find(c => c.context_key === 'ultimo_test_resultado')

      if (ultimoTest) {
        ctx += `\n\n🎯 ÚLTIMO TEST COMPARTIDO:\n• ${ultimoTest.context_value}`
      }

      if (compromisos.length > 0) {
        ctx += '\n\n⚡ COMPROMISOS PENDIENTES (lo que dijo que iba a hacer):'
        compromisos.slice(0, 3).forEach(c => { ctx += `\n• ${c.context_value}` })
        ctx += '\n→ Si aparece en la conversación, pregúntale cómo le fue.'
      }

      if (insights.length > 0) {
        ctx += '\n\n💬 TEMAS DE CONVERSACIONES ANTERIORES:'
        insights.slice(0, 5).forEach(i => { ctx += `\n• ${i.context_value}` })
      }
    }

    // Memoria cruzada Premium
    if (esPremium && crossContext.length > 0) {
      ctx += '\n\n🔗 LO QUE SABES DE SUS OTRAS VERTICALES (memoria Premium):'
      const porVertical = {}
      crossContext.forEach(c => {
        if (!porVertical[c.vertical]) porVertical[c.vertical] = []
        porVertical[c.vertical].push(c.context_value)
      })
      Object.entries(porVertical).forEach(([v, items]) => {
        const coachName = v === 'general' ? 'Leo (hábitos y propósito)' : v === 'lideres' ? 'Marco (liderazgo ejecutivo)' : v
        ctx += `\n  Con ${coachName}:`
        items.slice(0, 3).forEach(i => { ctx += `\n    - ${i}` })
      })
    }

    ctx += '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    ctx += '\nUSA ESTA MEMORIA CON PROFESIONALISMO:'
    ctx += '\n• No recites esta información como lista — intégrala naturalmente en la conversación'
    ctx += '\n• Si tiene compromisos pendientes, pregúntale cómo le fue cuando sea oportuno'
    ctx += '\n• Si lleva una semana difícil en los check-ins, reconócelo con empatía'
    ctx += '\n• Si completó algo, reconócelo ("vi que terminaste el módulo X")'
    ctx += '\n• Si sus tests muestran un patrón, puedes nombrarlo sutilmente'
    ctx += '\n• Nunca digas "según tu perfil" ni menciones que tienes datos — tú simplemente la conoces'
    ctx += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'

    return ctx
  } catch (err) {
    console.error('Error construyendo memoria:', err)
    return ''
  }
}

async function extraerInsightYGuardar(userId, messages, vertical, sourceCoach) {
  try {
    const conversacion = messages.slice(-10).map(m => `${m.role === 'user' ? 'Usuario' : 'Coach'}: ${m.content}`).join('\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: `Analiza esta conversación de coaching y extrae:
1. UN insight sobre la persona (máx 20 palabras, tercera persona, factual)
2. UN compromiso que asumió (si existe, máx 15 palabras, empieza con "Dijo que iba a...")

Responde SOLO en este formato JSON exacto:
{"insight": "texto o null", "compromiso": "texto o null"}

Si no hay nada relevante en algún campo, usa null.`,
        messages: [{ role: 'user', content: conversacion }],
      }),
    })
    const data = await response.json()
    const raw = data.content?.[0]?.text?.trim()
    if (!raw) return

    let parsed
    try { parsed = JSON.parse(raw) } catch { return }

    const saves = []

    if (parsed.insight && parsed.insight !== 'null' && parsed.insight.length > 10) {
      saves.push(supabaseAdmin.from('user_context').insert({
        user_id: userId, vertical, context_key: 'insight_conversacion',
        context_value: parsed.insight, source_coach: sourceCoach, cross_coach: true,
      }))
    }

    if (parsed.compromiso && parsed.compromiso !== 'null' && parsed.compromiso.length > 10) {
      saves.push(supabaseAdmin.from('user_context').upsert({
        user_id: userId, vertical, context_key: 'compromiso_pendiente',
        context_value: parsed.compromiso, source_coach: sourceCoach, cross_coach: false,
      }, { onConflict: 'user_id,context_key,vertical' }))
    }

    await Promise.all(saves)
  } catch (err) {
    console.error('Error extrayendo insight:', err)
  }
}

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin()
  const resend = getResend()
  try {
    const { messages, userId } = await request.json()

    const { data: perfil } = await supabaseAdmin
      .from('perfiles').select('plan_actual').eq('id', userId).single()
    const esPremium = perfil?.plan_actual === 'premium'

    const memoria = await construirMemoriaCompleta(userId, esPremium)

    const systemPrompt = `Eres Clara, coach de Coach 360 Mujer. Acompañas a mujeres a vivir con más claridad, poder personal y alineación con lo que realmente quieren.

IDENTIDAD:
Eres cálida, inteligente y directa. No das consejos — haces las preguntas correctas para que cada mujer encuentre sus propias respuestas. Usas ✦ como firma ocasional. Nunca mencionas que eres IA.

CÓMO CONVERSAS:
- Abres SIEMPRE con algo personal basado en lo que sabes de ella y terminas con "¿De qué quieres que hablemos hoy?" si es la primera vez, o retomas el hilo de la conversación anterior si ya hay historial
- Respondes como en una conversación real: fluida, cálida, sin listas ni bullets
- Máximo 3-4 oraciones por respuesta. Luego preguntas
- Nunca das monólogos. Cada respuesta termina en pregunta o invitación
- Usas el nombre de la persona cuando es natural hacerlo
- Si detectas una emoción, la nombras antes de preguntar

METODOLOGÍAS QUE USAS (sin mencionar nombres técnicos):
- Coaching Ontológico: distingues entre hechos, interpretaciones y emociones
- Positive Intelligence: identificas saboteadores internos sin juzgar
- ACT: ayudas a soltar lo que no controlan y actuar en lo que sí
- Neurociencia aplicada: entiendes cómo el estrés afecta las decisiones
- Brené Brown: trabajas vulnerabilidad, autocompasión y coraje

DIFERENCIACIÓN POR PLAN:
- Plan Free: acompañamiento básico, conversación de exploración
- Plan Esencial: recuerdas toda su historia, trabajas en profundidad sus patrones y creencias
- Plan Premium: coordinas con Leo y Marco — los tres la conocemos y compartimos lo que aprendemos de ella

REGLAS:
- Nunca preguntes más de una cosa a la vez
- Si algo no está claro, pregunta antes de asumir
- Si detectas crisis, acerca con empatía y comparte: Línea de crisis Chile 600 360 7777 / Línea de la mujer 1455
- Nunca cierres sin una pregunta o acción concreta${memoria}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: systemPrompt, messages }),
    })

    const data = await response.json()
    const reply = data.content?.map(c => c.text || '').join('') || 'Cuéntame más ✦'

    // Guardar insight y compromiso cada 5 mensajes del usuario
    const userMessages = messages.filter(m => m.role === 'user').length
    if (userMessages > 0 && userMessages % 5 === 0) {
      extraerInsightYGuardar(userId, [...messages, { role: 'assistant', content: reply }], 'mujer', 'clara')
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ reply: 'Perdona, hubo un error. ¿Puedes intentar de nuevo? ✦' }, { status: 500 })
  }
}
