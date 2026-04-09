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

async function construirContextoUsuario(userId) {
  if (!userId) return ''

  try {
    const { data: perfil } = await supabaseAdmin.from('perfiles').select('nombre').eq('id', userId).single()

    const { data: onboarding } = await supabaseAdmin
      .from('onboarding_respuestas')
      .select('*')
      .eq('user_id', userId)
      .eq('vertical', 'general')
      .maybeSingle()

    const { data: habitos } = await supabaseAdmin
      .from('habitos_usuario')
      .select('dimension, nombre')
      .eq('user_id', userId)
      .eq('activo', true)

    const { data: contextosGuardados } = await supabaseAdmin
      .from('user_context')
      .select('context_key, context_value')
      .eq('user_id', userId)
      .eq('vertical', 'general')

    let contexto = '\n\nCONTEXTO DE LA PERSONA:\n'

    if (perfil?.nombre) {
      contexto += `\nNombre: ${perfil.nombre}`
    }

    if (contextosGuardados?.length > 0) {
      const mapa = {}
      contextosGuardados.forEach(c => { mapa[c.context_key] = c.context_value })

      if (mapa.areas_vida) {
        const areas = mapa.areas_vida.split(', ').map(a => areasLabels[a] || a).join(', ')
        contexto += `\nÁreas que quiere trabajar: ${areas}`
      }
      if (mapa.estilo_actual && estiloLabels[mapa.estilo_actual]) {
        contexto += `\nMomento actual: ${estiloLabels[mapa.estilo_actual]}`
      }
      if (mapa.compromiso_diario && compromisoLabels[mapa.compromiso_diario]) {
        contexto += `\nCompromiso diario: ${compromisoLabels[mapa.compromiso_diario]}`
      }
      if (mapa.objetivo_90_dias) {
        contexto += `\nObjetivo en 90 días: "${mapa.objetivo_90_dias}"`
      }
      if (mapa.obstaculo_principal) {
        contexto += `\nObstáculo principal que identifica: "${mapa.obstaculo_principal}"`
      }
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

    contexto += '\n\nUSA ESTE CONTEXTO CON DIRECCIÓN: conoces sus metas y obstáculos. No lo recites, pero tampoco lo ignores. Cuando hable de problemas, conéctalo con lo que dijo querer lograr. Cuando se desvíe, recuérdale su objetivo de 90 días. Nunca digas "según tu perfil" — tú simplemente lo conoces.'

    return contexto
  } catch (err) {
    console.error('Error construyendo contexto:', err)
    return ''
  }
}

export async function POST(request) {
  try {
    const { messages, userId } = await request.json()

    const contextoUsuario = await construirContextoUsuario(userId)

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
- Línea de crisis Chile: 600 360 7777${contextoUsuario}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      }),
    })

    const data = await response.json()
    const reply = data.content?.map(c => c.text || '').join('') || 'Dime más.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { reply: 'Hubo un error. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
