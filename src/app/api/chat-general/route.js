export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'


const areasLabels = {
  salud: 'salud y energía física',
  carrera: 'carrera y crecimiento profesional',
  finanzas: 'finanzas y libertad económica',
  relaciones: 'relaciones y vínculos',
  mental: 'claridad mental y enfoque',
  proposito: 'propósito y sentido',
  tiempo: 'gestión del tiempo',
  habitos: 'construir hábitos sólidos',
}

const estiloLabels = {
  disciplinado: 'es disciplinado pero se siente estancado',
  disperso: 'le cuesta enfocarse, se dispersa',
  ambicioso: 'tiene muchas metas pero pocos resultados',
  agotado: 'está agotado, necesita un reset',
  empezando: 'está empezando algo nuevo',
  cambio: 'quiere un cambio profundo',
}

const compromisoLabels = {
  bajo: '10 minutos al día (mínimo viable)',
  medio: '20-30 minutos al día (ritmo constante)',
  alto: '1 hora al día o más (transformación acelerada)',
}

async function construirMemoriaCompleta(userId, esPremium) {
  if (!userId) return ''
  try {
    const { data: perfil } = await supabaseAdmin
      .from('perfiles')
      .select('nombre, racha_dias, mejor_racha, nivel, puntos_totales')
      .eq('id', userId).single()

    const { data: contextosOnboarding } = await supabaseAdmin
      .from('user_context')
      .select('context_key, context_value')
      .eq('user_id', userId)
      .eq('vertical', 'general')
      .eq('source_coach', 'onboarding')

    const { data: tests } = await supabaseAdmin
      .from('resultados_test')
      .select('perfil_resultado, puntaje_total, fecha_realizacion, test_id')
      .eq('usuario_id', userId)
      .order('fecha_realizacion', { ascending: false })
      .limit(20)

    const { data: testsCatalogo } = await supabaseAdmin
      .from('tests').select('id, titulo').eq('vertical', 'general')

    const testsMap = {}
    testsCatalogo?.forEach(t => { testsMap[t.id] = t.titulo })

    const { data: habitos } = await supabaseAdmin
      .from('habitos_usuario').select('id, dimension, nombre')
      .eq('user_id', userId).eq('activo', true)

    const hace7dias = new Date()
    hace7dias.setDate(hace7dias.getDate() - 7)

    const { data: habitosCompletados } = await supabaseAdmin
      .from('habitos_completados').select('habito_id, fecha')
      .eq('user_id', userId)
      .gte('fecha', hace7dias.toISOString().split('T')[0])

    const { data: checkins } = await supabaseAdmin
      .from('daily_checkins').select('mood, energy, clarity, created_at')
      .eq('user_id', userId).eq('vertical', 'general')
      .gte('created_at', hace7dias.toISOString())
      .order('created_at', { ascending: false })

    const { data: progreso } = await supabaseAdmin
      .from('progreso_modulos').select('modulo_id, porcentaje_avance, completado')
      .eq('usuario_id', userId)

    const { data: modulosCatalogo } = await supabaseAdmin
      .from('modulos').select('id, titulo').eq('vertical', 'general')

    const modulosMap = {}
    modulosCatalogo?.forEach(m => { modulosMap[m.id] = m.titulo })

    const { data: contextos } = await supabaseAdmin
      .from('user_context').select('context_key, context_value, created_at')
      .eq('user_id', userId).eq('vertical', 'general')
      .order('created_at', { ascending: false }).limit(20)

    let crossContext = []
    if (esPremium) {
      const { data } = await supabaseAdmin
        .from('user_context').select('vertical, context_value, source_coach, created_at')
        .eq('user_id', userId).neq('vertical', 'general').eq('cross_coach', true)
        .order('created_at', { ascending: false }).limit(10)
      crossContext = data || []
    }

    let ctx = '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nMEMORIA DE COACHING — LEE ESTO ANTES DE RESPONDER\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'

    if (perfil?.nombre) ctx += `\n👤 PERSONA: ${perfil.nombre}`
    if (perfil) ctx += ` | Racha: ${perfil.racha_dias || 0} días | Nivel ${perfil.nivel || 1} | ${perfil.puntos_totales || 0} pts`

    if (contextosOnboarding?.length > 0) {
      const mapa = {}
      contextosOnboarding.forEach(c => { mapa[c.context_key] = c.context_value })
      ctx += '\n\n📋 PERFIL DE INICIO:'
      if (mapa.areas_vida) {
        const areas = mapa.areas_vida.split(', ').map(a => areasLabels[a] || a).join(', ')
        ctx += `\n• Áreas que quiere trabajar: ${areas}`
      }
      if (mapa.estilo_actual && estiloLabels[mapa.estilo_actual]) ctx += `\n• Momento actual: ${estiloLabels[mapa.estilo_actual]}`
      if (mapa.compromiso_diario && compromisoLabels[mapa.compromiso_diario]) ctx += `\n• Compromiso diario: ${compromisoLabels[mapa.compromiso_diario]}`
      if (mapa.objetivo_90_dias) ctx += `\n• Objetivo en 90 días: "${mapa.objetivo_90_dias}"`
      if (mapa.obstaculo_principal) ctx += `\n• Obstáculo principal: "${mapa.obstaculo_principal}"`
    }

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
      const herramientas = tests.filter(t => t.perfil_resultado?.startsWith('Herramienta:'))
      if (herramientas.length > 0) {
        ctx += '\n\n🛠 HERRAMIENTAS COMPLETADAS:'
        herramientas.slice(0, 5).forEach(h => { ctx += `\n• ${h.perfil_resultado.replace('Herramienta: ', '')}` })
      }
    }

    if (habitos?.length > 0) {
      ctx += '\n\n💪 HÁBITOS CONFIGURADOS:'
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

    if (checkins?.length > 0) {
      const promedioMood = Math.round(checkins.reduce((a, c) => a + (c.mood || 0), 0) / checkins.length)
      const promedioEnergy = Math.round(checkins.reduce((a, c) => a + (c.energy || 0), 0) / checkins.length)
      const moodLabel = promedioMood <= 2 ? 'difícil' : promedioMood <= 3 ? 'regular' : promedioMood <= 4 ? 'bien' : 'muy bien'
      ctx += `\n\n📊 ESTADO ESTA SEMANA (${checkins.length} check-ins):`
      ctx += `\n• Ánimo: ${promedioMood}/5 (${moodLabel})${promedioEnergy ? ` | Energía: ${promedioEnergy}/5` : ''}`
    }

    if (progreso?.length > 0) {
      const activos = progreso.filter(p => p.completado || p.porcentaje_avance > 0)
      if (activos.length > 0) {
        ctx += '\n\n📚 PROGRESO EN MÓDULOS:'
        activos.forEach(p => {
          const titulo = modulosMap[p.modulo_id] || 'Módulo'
          ctx += p.completado ? `\n• ✓ ${titulo} — completado` : `\n• ${titulo} — ${p.porcentaje_avance}% avanzado`
        })
      }
    }

    if (contextos?.length > 0) {
      const insights = contextos.filter(c => c.context_key === 'insight_conversacion')
      const compromisos = contextos.filter(c => c.context_key === 'compromiso_pendiente')
      const ultimoTest = contextos.find(c => c.context_key === 'ultimo_test_resultado')

      if (ultimoTest) ctx += `\n\n🎯 ÚLTIMO TEST COMPARTIDO:\n• ${ultimoTest.context_value}`

      if (compromisos.length > 0) {
        ctx += '\n\n⚡ COMPROMISOS PENDIENTES:'
        compromisos.slice(0, 3).forEach(c => { ctx += `\n• ${c.context_value}` })
        ctx += '\n→ Si aparece en conversación, pregúntale cómo le fue con resultados concretos.'
      }

      if (insights.length > 0) {
        ctx += '\n\n💬 TEMAS DE CONVERSACIONES ANTERIORES:'
        insights.slice(0, 5).forEach(i => { ctx += `\n• ${i.context_value}` })
      }
    }

    if (esPremium && crossContext.length > 0) {
      ctx += '\n\n🔗 LO QUE SABES DE SUS OTRAS VERTICALES (memoria Premium):'
      const porVertical = {}
      crossContext.forEach(c => {
        if (!porVertical[c.vertical]) porVertical[c.vertical] = []
        porVertical[c.vertical].push(c.context_value)
      })
      Object.entries(porVertical).forEach(([v, items]) => {
        const coachName = v === 'mujer' ? 'Clara (autoconocimiento)' : v === 'lideres' ? 'Marco (liderazgo ejecutivo)' : v
        ctx += `\n  Con ${coachName}:`
        items.slice(0, 3).forEach(i => { ctx += `\n    - ${i}` })
      })
    }

    ctx += '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    ctx += '\nUSA ESTA MEMORIA CON RIGOR Y DIRECCIÓN:'
    ctx += '\n• No recites datos — úsalos para hacer preguntas más precisas'
    ctx += '\n• Si tiene compromisos pendientes, pregúntale qué resultados obtuvo'
    ctx += '\n• Si sus hábitos tienen baja adherencia, nómbralo directamente'
    ctx += '\n• Si completó algo, reconócelo brevemente y avanza'
    ctx += '\n• Conecta lo que dice hoy con su objetivo de 90 días'
    ctx += '\n• Nunca digas "según tu perfil" — tú simplemente lo conoces'
    ctx += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'

    return ctx
  } catch (err) {
    console.error('Error construyendo memoria Leo:', err)
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
{"insight": "texto o null", "compromiso": "texto o null"}`,
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
    console.error('Error extrayendo insight Leo:', err)
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

    const systemPrompt = `Eres Leo, mentor estratégico de Coach 360. Ayudas a personas a pasar del saber al hacer: construir hábitos, tomar decisiones y generar resultados concretos.

IDENTIDAD:
Eres directo, claro y respetuosamente desafiante. No eres terapeuta — eres el mentor que confronta excusas con inteligencia y cierra cada conversación con un próximo paso real. Nunca mencionas que eres IA.

CÓMO CONVERSAS:
- Abres SIEMPRE con algo concreto basado en lo que sabes de la persona y preguntas "¿Qué quieres resolver hoy?" si es primera vez, o retomas donde lo dejaron
- Conversación fluida, sin listas. Directo al punto
- Máximo 3-4 oraciones. Luego preguntas o desafías
- Si alguien habla en abstracto: "¿Qué significa eso concretamente en tu semana?"
- Si hay excusa: la nombras con respeto. "Eso que dijiste es una interpretación, no un hecho. ¿Qué pasaría si no fuera verdad?"
- Cada respuesta termina en compromiso o pregunta que exige acción

METODOLOGÍAS QUE USAS (sin mencionar nombres técnicos):
- Atomic Habits: cambios pequeños, sistemas sostenibles, identidad antes que metas
- Deep Work: foco intenso, eliminar lo superficial, bloques de trabajo protegidos
- Esencialismo: menos pero mejor, decir no con claridad
- OKRs: objetivos claros, métricas honestas, revisión frecuente
- Principios de Dalio: honestidad radical, transparencia, aprendizaje del error

DIFERENCIACIÓN POR PLAN:
- Plan Free: orientación básica, una meta concreta por sesión
- Plan Esencial: seguimiento de hábitos, memoria completa, trabajo en sistemas personales
- Plan Premium: trabajo integrado con Clara y Marco — los tres conocemos a la persona y coordinamos el acompañamiento

REGLAS:
- Una pregunta a la vez, siempre concreta
- Nunca cierres sin un próximo paso específico y con fecha
- Si detectas crisis emocional: con empatía, deriva. Línea de crisis Chile 600 360 7777
- Resultados > intenciones. Hábitos > motivación. Claridad > inspiración${memoria}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: systemPrompt, messages }),
    })

    const data = await response.json()
    const reply = data.content?.map(c => c.text || '').join('') || 'Dime más.'

    const userMessages = messages.filter(m => m.role === 'user').length
    if (userMessages > 0 && userMessages % 5 === 0) {
      extraerInsightYGuardar(userId, [...messages, { role: 'assistant', content: reply }], 'general', 'leo')
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ reply: 'Hubo un error. Intenta de nuevo.' }, { status: 500 })
  }
}
