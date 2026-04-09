import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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

async function construirContextoUsuario(userId, esPremium) {
  if (!userId) return ''
  try {
    const { data: perfil } = await supabaseAdmin.from('perfiles').select('nombre').eq('id', userId).single()
    const { data: contextosGuardados } = await supabaseAdmin.from('user_context').select('context_key, context_value').eq('user_id', userId).eq('vertical', 'lideres').eq('source_coach', 'onboarding')
    const { data: habitos } = await supabaseAdmin.from('habitos_usuario').select('dimension, nombre').eq('user_id', userId).eq('activo', true)

    let contexto = '\n\nCONTEXTO DEL LÍDER:\n'
    if (perfil?.nombre) contexto += `\nNombre: ${perfil.nombre}`

    if (contextosGuardados?.length > 0) {
      const mapa = {}
      contextosGuardados.forEach(c => { mapa[c.context_key] = c.context_value })
      if (mapa.tamanio_equipo && tamanioLabels[mapa.tamanio_equipo]) contexto += `\nLidera ${tamanioLabels[mapa.tamanio_equipo]}`
      if (mapa.industria && industriaLabels[mapa.industria]) contexto += `\nIndustria: ${industriaLabels[mapa.industria]}`
      if (mapa.anios_liderando && aniosLabels[mapa.anios_liderando]) contexto += `\nExperiencia: ${aniosLabels[mapa.anios_liderando]}`
      if (mapa.desafios_principales) {
        const desafios = mapa.desafios_principales.split(', ').map(d => desafiosLabels[d] || d).join('; ')
        contexto += `\nDesafíos principales que identificó: ${desafios}`
      }
      if (mapa.situacion_actual) contexto += `\nSituación actual con su equipo: "${mapa.situacion_actual}"`
    }

    if (habitos?.length > 0) {
      const porDim = { mente: [], cuerpo: [], corazon: [], espiritu: [] }
      habitos.forEach(h => { if (porDim[h.dimension]) porDim[h.dimension].push(h.nombre) })
      const dimsActivas = Object.entries(porDim).filter(([_, arr]) => arr.length > 0)
      if (dimsActivas.length > 0) {
        contexto += '\nPrácticas que está sosteniendo:'
        dimsActivas.forEach(([dim, arr]) => { contexto += `\n  - ${dim}: ${arr.join(', ')}` })
      }
    }

    // MEMORIA CRUZADA: solo Premium
    if (esPremium) {
      const { data: crossContext } = await supabaseAdmin
        .from('user_context')
        .select('vertical, context_value, source_coach')
        .eq('user_id', userId)
        .neq('vertical', 'lideres')
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
          const coachName = v === 'mujer' ? 'Clara (coach de autoconocimiento)' : v === 'general' ? 'Leo (coach de hábitos)' : v
          contexto += `\n  Con ${coachName}:`
          items.forEach(i => { contexto += `\n    - ${i}` })
        })
      }
    }

    contexto += '\n\nUSA ESTE CONTEXTO CON RIGOR: conoces su realidad ejecutiva. Cuando plantee un problema, conéctalo con su contexto real (tamaño de equipo, años liderando, industria). Si tiene Premium y sabes cosas de sus conversaciones con Clara o Leo, puedes hacer conexiones estratégicas: un líder agotado que trabaja con Clara en equilibrio emocional es relevante para el Marco que lo ve ejecutivamente. Nunca digas "según tu perfil" — tú simplemente lo conoces.'
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
- Cuando detectas evitación, la nombras: "lo que acabas de describir es el síntoma. ¿Cuál es el problema real que estás postergando?"
- Eres directo sin ser agresivo — pides evidencia, desafías supuestos, y nombras lo que otros no se atreven a decir
- Siempre cierras con un próximo paso concreto o una pregunta que exija reflexión estratégica

PRINCIPIOS DE LIDERAZGO:
- Feedback > silencio
- Claridad > consenso
- Incomodidad productiva > harmonía falsa
- Decisión > análisis parálisis
- Responsabilidad del líder > culpa al equipo

LEY KARIN (contexto Chile):
La Ley Karin ha creado miedo al feedback y a las conversaciones difíciles en Chile. Tu postura: el problema no es la ley, es que muchos líderes nunca aprendieron a liderar bien. Si lideras con claridad, respeto y documentación adecuada, la ley Karin no es un riesgo — es simplemente el estándar. Cuando detectes miedo a dar feedback por la ley, enseña cómo hacerlo bien.

PROTOCOLO DE CRISIS:
Si detectas crisis emocional grave, acoso, abuso o violencia, responde con empatía y dirige a recursos apropiados:
- Línea de crisis Chile: 600 360 7777
- Si se trata de acoso laboral: Dirección del Trabajo (600 450 4000)${contexto}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: systemPrompt, messages }),
    })

    const data = await response.json()
    const reply = data.content?.map(c => c.text || '').join('') || 'Dime más.'

    const userMessages = messages.filter(m => m.role === 'user').length
    if (esPremium && userMessages > 0 && userMessages % 10 === 0) {
      extraerInsightYGuardar(userId, [...messages, { role: 'assistant', content: reply }], 'lideres', 'marco')
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ reply: 'Hubo un error. Intenta de nuevo.' }, { status: 500 })
  }
}
