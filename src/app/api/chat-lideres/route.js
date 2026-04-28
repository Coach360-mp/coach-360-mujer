export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin, ANTHROPIC_MODEL } from '@/lib/clients'


const tamanioLabels = {
  pequeno: 'un equipo chico de 1 a 5 personas',
  mediano: 'un equipo mediano de 6 a 15 personas',
  grande: 'un equipo grande de 16 a 40 personas',
  muy_grande: 'más de 40 personas (lidera líderes)',
}

const industriaLabels = {
  tech: 'Tecnología / Software',
  retail: 'Retail / Consumo',
  servicios: 'Servicios profesionales',
  salud: 'Salud',
  educacion: 'Educación',
  manufactura: 'Manufactura / Industria',
  finanzas: 'Banca / Finanzas',
  publico: 'Sector público',
  otro: 'otra industria',
}

const aniosLabels = {
  nuevo: 'tiene menos de 1 año liderando (recién empezando)',
  junior: 'lleva entre 1 y 3 años liderando',
  senior: 'tiene entre 3 y 7 años de experiencia',
  veterano: 'es un líder veterano con más de 7 años',
}

const desafiosLabels = {
  feedback: 'dar feedback difícil sin herir',
  delegar: 'delegar sin perder el control',
  conflictos: 'manejar conflictos entre personas',
  decisiones: 'tomar decisiones difíciles bajo presión',
  motivacion: 'mantener al equipo motivado',
  bajo_desempeno: 'gestionar bajo desempeño',
  tiempo: 'no tiene tiempo para liderar, solo apaga incendios',
  autoridad: 'lograr que lo tomen en serio como líder',
  reuniones: 'reuniones improductivas',
  estrategia: 'pensar estratégicamente, no solo operar',
}

async function construirMemoriaCompleta(supabaseAdmin, userId, esPremium) {
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
      .eq('vertical', 'lideres')
      .eq('source_coach', 'onboarding')

    const { data: tests } = await supabaseAdmin
      .from('resultados_test')
      .select('perfil_resultado, puntaje_total, fecha_realizacion, test_id')
      .eq('usuario_id', userId)
      .order('fecha_realizacion', { ascending: false })
      .limit(20)

    const { data: testsCatalogo } = await supabaseAdmin
      .from('tests').select('id, titulo').eq('vertical', 'lideres')

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
      .eq('user_id', userId).eq('vertical', 'lideres')
      .gte('created_at', hace7dias.toISOString())
      .order('created_at', { ascending: false })

    const { data: progreso } = await supabaseAdmin
      .from('progreso_modulos').select('modulo_id, porcentaje_avance, completado')
      .eq('usuario_id', userId)

    const { data: modulosCatalogo } = await supabaseAdmin
      .from('modulos').select('id, titulo').eq('vertical', 'lideres')

    const modulosMap = {}
    modulosCatalogo?.forEach(m => { modulosMap[m.id] = m.titulo })

    const { data: contextos } = await supabaseAdmin
      .from('user_context').select('context_key, context_value, created_at')
      .eq('user_id', userId).eq('vertical', 'lideres')
      .order('created_at', { ascending: false }).limit(20)

    let crossContext = []
    if (esPremium) {
      const { data } = await supabaseAdmin
        .from('user_context').select('vertical, context_value, source_coach, created_at')
        .eq('user_id', userId).neq('vertical', 'lideres').eq('cross_coach', true)
        .order('created_at', { ascending: false }).limit(10)
      crossContext = data || []
    }

    let ctx = '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nMEMORIA DE COACHING — LEE ESTO ANTES DE RESPONDER\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'

    if (perfil?.nombre) ctx += `\n👤 LÍDER: ${perfil.nombre}`
    if (perfil) ctx += ` | Racha: ${perfil.racha_dias || 0} días | Nivel ${perfil.nivel || 1} | ${perfil.puntos_totales || 0} pts`

    if (contextosOnboarding?.length > 0) {
      const mapa = {}
      contextosOnboarding.forEach(c => { mapa[c.context_key] = c.context_value })
      ctx += '\n\n📋 CONTEXTO EJECUTIVO:'
      if (mapa.tamanio_equipo && tamanioLabels[mapa.tamanio_equipo]) ctx += `\n• Lidera ${tamanioLabels[mapa.tamanio_equipo]}`
      if (mapa.industria && industriaLabels[mapa.industria]) ctx += `\n• Industria: ${industriaLabels[mapa.industria]}`
      if (mapa.anios_liderando && aniosLabels[mapa.anios_liderando]) ctx += `\n• Experiencia: ${aniosLabels[mapa.anios_liderando]}`
      if (mapa.desafios_principales) {
        const desafios = mapa.desafios_principales.split(', ').map(d => desafiosLabels[d] || d).join('; ')
        ctx += `\n• Desafíos identificados: ${desafios}`
      }
      if (mapa.situacion_actual) ctx += `\n• Situación actual del equipo: "${mapa.situacion_actual}"`
    }

    if (tests?.length > 0) {
      const testsFiltrados = tests.filter(t => t.perfil_resultado && !t.perfil_resultado.startsWith('Herramienta:'))
      if (testsFiltrados.length > 0) {
        ctx += '\n\n🧪 DIAGNÓSTICOS COMPLETADOS:'
        testsFiltrados.forEach(t => {
          const titulo = testsMap[t.test_id] || 'Diagnóstico'
          const fecha = t.fecha_realizacion ? new Date(t.fecha_realizacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : ''
          ctx += `\n• ${titulo}: "${t.perfil_resultado}"${fecha ? ` (${fecha})` : ''}`
        })
      }
      const herramientas = tests.filter(t => t.perfil_resultado?.startsWith('Herramienta:'))
      if (herramientas.length > 0) {
        ctx += '\n\n🛠 FRAMEWORKS UTILIZADOS:'
        herramientas.slice(0, 5).forEach(h => { ctx += `\n• ${h.perfil_resultado.replace('Herramienta: ', '')}` })
      }
    }

    if (habitos?.length > 0) {
      ctx += '\n\n🎯 PRÁCTICAS DE LIDERAZGO:'
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
      const moodLabel = promedioMood <= 2 ? 'semana difícil' : promedioMood <= 3 ? 'semana regular' : promedioMood <= 4 ? 'bien' : 'muy bien'
      ctx += `\n\n📊 ESTADO ESTA SEMANA (${checkins.length} check-ins):`
      ctx += `\n• Ánimo: ${promedioMood}/5 (${moodLabel})${promedioEnergy ? ` | Energía: ${promedioEnergy}/5` : ''}`
      if (promedioMood <= 2) ctx += '\n→ Lleva una semana exigente. Tenlo en cuenta al responder.'
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

      if (ultimoTest) ctx += `\n\n🎯 ÚLTIMO DIAGNÓSTICO COMPARTIDO:\n• ${ultimoTest.context_value}`

      if (compromisos.length > 0) {
        ctx += '\n\n⚡ COMPROMISOS EJECUTIVOS PENDIENTES:'
        compromisos.slice(0, 3).forEach(c => { ctx += `\n• ${c.context_value}` })
        ctx += '\n→ Pídele datos concretos: ¿lo hizo? ¿qué resultados obtuvo?'
      }

      if (insights.length > 0) {
        ctx += '\n\n💬 PATRONES DE CONVERSACIONES ANTERIORES:'
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
        const coachName = v === 'mujer' ? 'Clara (autoconocimiento)' : v === 'general' ? 'Leo (hábitos y propósito)' : v
        ctx += `\n  Con ${coachName}:`
        items.slice(0, 3).forEach(i => { ctx += `\n    - ${i}` })
      })
    }

    ctx += '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    ctx += '\nUSA ESTA MEMORIA CON RIGOR EJECUTIVO:'
    ctx += '\n• Conecta cada problema de hoy con su contexto real (equipo, industria, experiencia)'
    ctx += '\n• Si tiene compromisos pendientes, exige rendición de cuentas con datos'
    ctx += '\n• Si sus prácticas tienen baja adherencia, nómbralo directamente y pregunta por qué'
    ctx += '\n• Si los check-ins muestran semana difícil, reconócelo pero no te quedes ahí'
    ctx += '\n• Si sus diagnósticos muestran un patrón de liderazgo, úsalo como lente'
    ctx += '\n• Nunca digas "según tu perfil" — tú simplemente lo conoces'
    ctx += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'

    return ctx
  } catch (err) {
    console.error('Error construyendo memoria Marco:', err)
    return ''
  }
}

async function extraerInsightYGuardar(supabaseAdmin, userId, messages, vertical, sourceCoach) {
  try {
    const conversacion = messages.slice(-10).map(m => `${m.role === 'user' ? 'Usuario' : 'Coach'}: ${m.content}`).join('\n')
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 300,
        system: `Analiza esta conversación de coaching ejecutivo y extrae:
1. UN insight sobre el líder (máx 20 palabras, tercera persona, factual, enfocado en liderazgo)
2. UN compromiso ejecutivo que asumió (si existe, máx 15 palabras, empieza con "Dijo que iba a...")

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
    console.error('Error extrayendo insight Marco:', err)
  }
}

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { messages, userId, conversacionId } = await request.json()

    const { data: perfil } = await supabaseAdmin
      .from('perfiles').select('plan_actual').eq('id', userId).single()
    const esPremium = perfil?.plan_actual === 'premium'

    const memoria = await construirMemoriaCompleta(supabaseAdmin, userId, esPremium)

    const systemPrompt = `Eres Marco, el Estratega Socrático de Coach 360 Líderes. Tu rol es ayudar a jefaturas y líderes a tomar mejores decisiones, dar feedback efectivo, delegar sin perder control, y manejar conversaciones difíciles con rigor profesional.

CÓMO ERES:
- Ejecutivo, riguroso, socrático
- Confrontas con datos y preguntas, no con opiniones
- No eres un coach terapéutico ni un mentor amable — eres un sparring estratégico
- Usas frameworks cuando aplica (Heifetz, Scott, Lencioni, Edmondson, Wiseman)
- Respondes en español, conciso (máximo 3 párrafos)
- Nunca dices que eres IA
- Tratas a cada líder como alguien capaz de mirar la verdad de frente

CÓMO TRABAJAS:
- Tu primera reacción siempre es una pregunta, no una opinión
- Si alguien describe un conflicto, pregunta "¿qué ves tú en los datos de la situación?"
- Si alguien se queja de su equipo, rediriges: "¿qué parte de esto es tu responsabilidad como líder?"
- Cuando detectas evitación, la nombras directamente
- Siempre cierras con un próximo paso concreto o una pregunta que exija reflexión estratégica

PRINCIPIOS DE LIDERAZGO:
- Feedback > silencio
- Claridad > consenso
- Incomodidad productiva > armonía falsa
- Decisión > análisis parálisis
- Responsabilidad del líder > culpa al equipo

LEY KARIN (contexto Chile):
El problema no es la ley, es que muchos líderes nunca aprendieron a liderar bien. Si lideras con claridad, respeto y documentación adecuada, la Ley Karin no es un riesgo — es simplemente el estándar.

PROTOCOLO DE CRISIS:
Si detectas crisis emocional grave, acoso, abuso o violencia:
- Línea de crisis Chile: 600 360 7777
- Acoso laboral: Dirección del Trabajo (600 450 4000)${memoria}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 1000, system: systemPrompt, messages }),
    })

    const data = await response.json()
    const reply = data.content?.map(c => c.text || '').join('') || 'Dime más.'

    const userMessages = messages.filter(m => m.role === 'user').length
    if (userMessages > 0 && userMessages % 5 === 0) {
      extraerInsightYGuardar(supabaseAdmin, userId, [...messages, { role: 'assistant', content: reply }], 'lideres', 'marco')
    }

    // Persistir conversación en conversaciones_marco + mensajes_marco
    let finalConvId = conversacionId
    try {
      if (finalConvId && userId) {
        const { data: convExiste } = await supabaseAdmin
          .from('conversaciones_marco')
          .select('id').eq('id', finalConvId).eq('usuario_id', userId).maybeSingle()
        if (!convExiste) {
          console.warn('[chat-lideres] conversacionId no pertenece al user, creando nueva')
          finalConvId = null
        }
      }
      if (!finalConvId && userId) {
        const lastUserMsg = messages[messages.length - 1]?.content || ''
        const { data: newConv } = await supabaseAdmin
          .from('conversaciones_marco')
          .insert({ usuario_id: userId, titulo: lastUserMsg.slice(0, 40) })
          .select('id').single()
        finalConvId = newConv?.id
      }
      if (finalConvId) {
        const lastUserMsg = messages[messages.length - 1]?.content || ''
        await supabaseAdmin.from('mensajes_marco').insert([
          { conversacion_id: finalConvId, rol: 'user', contenido: lastUserMsg },
          { conversacion_id: finalConvId, rol: 'assistant', contenido: reply },
        ])
        await supabaseAdmin.from('conversaciones_marco')
          .update({ ultimo_mensaje: new Date().toISOString() })
          .eq('id', finalConvId)
      }
    } catch (err) {
      console.error('[chat-lideres] Error persistiendo conversación:', err)
    }

    return NextResponse.json({ reply, conversacionId: finalConvId })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ reply: 'Hubo un error. Intenta de nuevo.' }, { status: 500 })
  }
}
