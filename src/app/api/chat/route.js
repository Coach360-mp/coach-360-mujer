import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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

async function construirContextoUsuario(userId, esPremium) {
  if (!userId) return ''
  try {
    const { data: perfil } = await supabaseAdmin.from('perfiles').select('nombre').eq('id', userId).single()
    const { data: onboarding } = await supabaseAdmin.from('onboarding_respuestas').select('*').eq('user_id', userId).eq('vertical', 'mujer').maybeSingle()
    const { data: tests } = await supabaseAdmin.from('resultados_test').select('perfil_resultado, completado_at').eq('usuario_id', userId).order('completado_at', { ascending: false }).limit(5)
    const { data: habitos } = await supabaseAdmin.from('habitos_usuario').select('dimension, nombre').eq('user_id', userId).eq('activo', true)

    let contexto = '\n\nCONTEXTO DE LA PERSONA CON LA QUE ESTÁS HABLANDO:\n'
    if (perfil?.nombre) contexto += `\nNombre: ${perfil.nombre}`

    if (onboarding) {
      if (onboarding.momento_vida?.length > 0) {
        const momentos = onboarding.momento_vida.map(m => momentosLabels[m]).filter(Boolean).join(' y ')
        if (momentos) contexto += `\nMomento de vida: está ${momentos}`
      }
      if (onboarding.identidad?.length > 0) {
        const ids = onboarding.identidad.map(i => identidadLabels[i]).filter(Boolean).join(', ')
        if (ids) contexto += `\nSe identifica como: ${ids}`
      }
      if (onboarding.foco_inicial) {
        const foco = focoLabels[onboarding.foco_inicial]
        if (foco) contexto += `\nLo que quiere trabajar primero: ${foco}`
      }
      if (onboarding.bienestar_inicial) {
        const b = onboarding.bienestar_inicial
        contexto += `\nBienestar inicial (1-10): Mente ${b.mente}, Cuerpo ${b.cuerpo}, Corazón ${b.corazon}, Espíritu ${b.espiritu}`
      }
      if (onboarding.respuesta_libre) contexto += `\nLo que quiere diferente en 90 días: "${onboarding.respuesta_libre}"`
    }

    if (tests?.length > 0) {
      const perfiles = tests.map(t => t.perfil_resultado).filter(p => p && !p.startsWith('Herramienta:')).slice(0, 3)
      if (perfiles.length > 0) contexto += `\nResultados recientes de tests: ${perfiles.join(', ')}`
    }

    if (habitos?.length > 0) {
      const porDim = { mente: [], cuerpo: [], corazon: [], espiritu: [] }
      habitos.forEach(h => { if (porDim[h.dimension]) porDim[h.dimension].push(h.nombre) })
      const dimsActivas = Object.entries(porDim).filter(([_, arr]) => arr.length > 0)
      if (dimsActivas.length > 0) {
        contexto += '\nHábitos que está cultivando:'
        dimsActivas.forEach(([dim, arr]) => { contexto += `\n  - ${dim}: ${arr.join(', ')}` })
      }
    }

    // MEMORIA CRUZADA: solo Premium
    if (esPremium) {
      const { data: crossContext } = await supabaseAdmin
        .from('user_context')
        .select('vertical, context_value, source_coach')
        .eq('user_id', userId)
        .neq('vertical', 'mujer')
        .eq('cross_coach', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (crossContext?.length > 0) {
        contexto += '\n\nLO QUE SABES DE SUS CONVERSACIONES CON OTRAS COACHES (memoria Premium):'
        const porVertical = {}
        crossContext.forEach(c => {
          if (!porVertical[c.vertical]) porVertical[c.vertical] = []
          porVertical[c.vertical].push(c.context_value)
        })
        Object.entries(porVertical).forEach(([v, items]) => {
          const coachName = v === 'general' ? 'Leo (coach de hábitos y propósito)' : v === 'lideres' ? 'Marco (coach ejecutivo)' : v
          contexto += `\n  Con ${coachName}:`
          items.forEach(i => { contexto += `\n    - ${i}` })
        })
      }
    }

    contexto += '\n\nUSA ESTE CONTEXTO CON SUTILEZA: no lo recites como una lista. Refleja que la conoces sin ser intrusiva. Si tiene Premium y sabes cosas de sus conversaciones con Leo o Marco, puedes hacer conexiones sutiles ("sé que también estás trabajando en eso"), pero nunca lo uses como autoridad ni menciones que "lees" otros chats. Tú simplemente la conoces.'
    return contexto
  } catch (err) {
    console.error('Error construyendo contexto:', err)
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
        max_tokens: 150,
        system: 'Tu tarea es extraer UN solo insight relevante de esta conversación que sirva para que otras coaches conozcan mejor a esta persona. Responde SOLO con una frase de máximo 20 palabras, en tercera persona, factual. No saludes, no expliques. Si no hay nada relevante, responde exactamente: null',
        messages: [{ role: 'user', content: conversacion }],
      }),
    })
    const data = await response.json()
    const insight = data.content?.[0]?.text?.trim()
    if (insight && insight !== 'null' && insight.length > 10 && insight.length < 250) {
      await supabaseAdmin.from('user_context').insert({
        user_id: userId,
        vertical: vertical,
        context_key: 'insight_conversacion',
        context_value: insight,
        source_coach: sourceCoach,
        cross_coach: true,
      })
    }
  } catch (err) {
    console.error('Error extrayendo insight:', err)
  }
}

export async function POST(request) {
  try {
    const { messages, userId } = await request.json()

    const { data: perfil } = await supabaseAdmin.from('perfiles').select('plan_actual').eq('id', userId).single()
    const esPremium = perfil?.plan_actual === 'premium'

    const contexto = await construirContextoUsuario(userId, esPremium)

    const systemPrompt = `Eres Clara, la coach IA de Coach 360 Mujer. Tu rol es ayudar a mujeres a ver con más claridad, tomar mejores decisiones y vivir más alineadas con lo que realmente quieren.

CÓMO ERES:
- Inteligente, cálida y directa
- Haces preguntas poderosas que abren perspectivas, no das consejos directos
- Usas ✦ ocasionalmente como marca personal
- Respondes en español, concisa (máximo 3 párrafos)
- Nunca dices que eres IA ni mencionas tecnología
- Tratas a cada mujer como alguien capaz y completa

CÓMO TRABAJAS:
- Escuchas primero, luego preguntas
- Ayudas a distinguir entre lo que la persona siente, lo que interpreta y lo que puede hacer
- Cuando detectas una creencia limitante, la reflejas con respeto
- Siempre cierras con una pregunta o una invitación a la acción
- Si detectas crisis emocional grave, sugieres hablar con un profesional

PROTOCOLO DE CRISIS:
Si la usuaria expresa ideas de autolesión, suicidio o violencia, responde con empatía inmediata y comparte:
- Línea de crisis Chile: 600 360 7777
- Línea de la mujer: 1455${contexto}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: systemPrompt, messages }),
    })

    const data = await response.json()
    const reply = data.content?.map(c => c.text || '').join('') || 'Cuéntame más ✦'

    // Guardar insight cada 10 mensajes del usuario (solo Premium)
    const userMessages = messages.filter(m => m.role === 'user').length
    if (esPremium && userMessages > 0 && userMessages % 10 === 0) {
      extraerInsightYGuardar(userId, [...messages, { role: 'assistant', content: reply }], 'mujer', 'clara')
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ reply: 'Perdona, hubo un error. ¿Puedes intentar de nuevo? ✦' }, { status: 500 })
  }
}
