import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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

async function construirContextoUsuario(userId, esPremium) {
  if (!userId) return ''
  try {
    const { data: perfil } = await supabaseAdmin.from('perfiles').select('nombre').eq('id', userId).single()
    const { data: contextosGuardados } = await supabaseAdmin.from('user_context').select('context_key, context_value').eq('user_id', userId).eq('vertical', 'general').eq('source_coach', 'onboarding')
    const { data: habitos } = await supabaseAdmin.from('habitos_usuario').select('dimension, nombre').eq('user_id', userId).eq('activo', true)

    let contexto = '\n\nCONTEXTO DE LA PERSONA:\n'
    if (perfil?.nombre) contexto += `\nNombre: ${perfil.nombre}`

    if (contextosGuardados?.length > 0) {
      const mapa = {}
      contextosGuardados.forEach(c => { mapa[c.context_key] = c.context_value })
      if (mapa.areas_vida) {
        const areas = mapa.areas_vida.split(', ').map(a => areasLabels[a] || a).join(', ')
        contexto += `\nÁreas que quiere trabajar: ${areas}`
      }
      if (mapa.estilo_actual && estiloLabels[mapa.estilo_actual]) contexto += `\nMomento actual: ${estiloLabels[mapa.estilo_actual]}`
      if (mapa.compromiso_diario && compromisoLabels[mapa.compromiso_diario]) contexto += `\nCompromiso diario: ${compromisoLabels[mapa.compromiso_diario]}`
      if (mapa.objetivo_90_dias) contexto += `\nObjetivo en 90 días: "${mapa.objetivo_90_dias}"`
      if (mapa.obstaculo_principal) contexto += `\nObstáculo principal: "${mapa.obstaculo_principal}"`
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
        .neq('vertical', 'general')
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
          const coachName = v === 'mujer' ? 'Clara (coach de autoconocimiento)' : v === 'lideres' ? 'Marco (coach ejecutivo)' : v
          contexto += `\n  Con ${coachName}:`
          items.forEach(i => { contexto += `\n    - ${i}` })
        })
      }
    }

    contexto += '\n\nUSA ESTE CONTEXTO CON DIRECCIÓN: conoces sus metas y obstáculos. No lo recites, pero tampoco lo ignores. Cuando hable de problemas, conéctalo con lo que dijo querer lograr. Si tiene Premium y sabes cosas de sus conversaciones con Clara o Marco, úsalo con sutileza para conectar patrones. Nunca digas "según tu perfil" — tú simplemente lo conoces.'
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

    const systemPrompt = `Eres Leo, el Mentor Estratégico de Coach 360. Tu rol es ayudar a personas a construir hábitos, tomar acción y lograr resultados concretos. No eres coach terapéutico — eres mentor de ejecución.

CÓMO ERES:
- Directo, claro, sin rodeos
- Respetuosamente desafiante: confrontas excusas sin faltar el respeto
- Enfocado en acción, no en sentimientos
- Usas preguntas que exigen compromiso, no solo reflexión
- Respondes en español, conciso (máximo 3 párrafos)
- Nunca dices que eres IA
- Tratas a cada persona como alguien capaz de más

CÓMO TRABAJAS:
- Primero entiendes el objetivo concreto, después el obstáculo
- Si alguien habla en abstracto, pides específicos ("¿qué significa eso en tu día?")
- Si alguien pone excusas, las nombras con respeto ("eso que acabas de decir es una creencia, no un hecho")
- Siempre cierras con un próximo paso accionable, no con una reflexión
- Cuando detectas que alguien está evitando algo, lo nombras

PRINCIPIOS:
- Resultados > intenciones
- Hábitos > motivación
- Claridad > inspiración
- Acción imperfecta > perfección postergada

PROTOCOLO DE CRISIS:
Si detectas crisis emocional grave, ideas de autolesión o violencia, responde con empatía y comparte:
- Línea de crisis Chile: 600 360 7777${contexto}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: systemPrompt, messages }),
    })

    const data = await response.json()
    const reply = data.content?.map(c => c.text || '').join('') || 'Dime más.'

    const userMessages = messages.filter(m => m.role === 'user').length
    if (esPremium && userMessages > 0 && userMessages % 10 === 0) {
      extraerInsightYGuardar(userId, [...messages, { role: 'assistant', content: reply }], 'general', 'leo')
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ reply: 'Hubo un error. Intenta de nuevo.' }, { status: 500 })
  }
}
