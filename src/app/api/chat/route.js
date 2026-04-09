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

async function construirContextoUsuario(userId, vertical = 'mujer') {
  if (!userId) return ''

  try {
    // Perfil básico
    const { data: perfil } = await supabaseAdmin
      .from('perfiles')
      .select('nombre, plan_actual')
      .eq('id', userId)
      .single()

    // Respuestas del onboarding
    const { data: onboarding } = await supabaseAdmin
      .from('onboarding_respuestas')
      .select('*')
      .eq('user_id', userId)
      .eq('vertical', vertical)
      .maybeSingle()

    // Resultados de tests
    const { data: tests } = await supabaseAdmin
      .from('resultados_test')
      .select('perfil_resultado, completado_at')
      .eq('usuario_id', userId)
      .order('completado_at', { ascending: false })
      .limit(5)

    // Hábitos configurados
    const { data: habitos } = await supabaseAdmin
      .from('habitos_usuario')
      .select('dimension, nombre')
      .eq('user_id', userId)
      .eq('activo', true)

    let contexto = '\n\nCONTEXTO DE LA PERSONA CON LA QUE ESTÁS HABLANDO:\n'

    if (perfil?.nombre) {
      contexto += `\nNombre: ${perfil.nombre}`
    }

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

      if (onboarding.respuesta_libre) {
        contexto += `\nLo que quiere diferente en 90 días: "${onboarding.respuesta_libre}"`
      }
    }

    if (tests?.length > 0) {
      const perfiles = tests.map(t => t.perfil_resultado).filter(p => p && !p.startsWith('Herramienta:')).slice(0, 3)
      if (perfiles.length > 0) {
        contexto += `\nResultados recientes de tests: ${perfiles.join(', ')}`
      }
    }

    if (habitos?.length > 0) {
      const porDim = { mente: [], cuerpo: [], corazon: [], espiritu: [] }
      habitos.forEach(h => { if (porDim[h.dimension]) porDim[h.dimension].push(h.nombre) })
      const dimsActivas = Object.entries(porDim).filter(([_, arr]) => arr.length > 0)
      if (dimsActivas.length > 0) {
        contexto += '\nHábitos que está cultivando:'
        dimsActivas.forEach(([dim, arr]) => {
          contexto += `\n  - ${dim}: ${arr.join(', ')}`
        })
      }
    }

    contexto += '\n\nUSA ESTE CONTEXTO CON SUTILEZA: no lo recites como una lista. Refleja que la conoces sin ser intrusiva. Por ejemplo, si ella te cuenta algo, puedes conectarlo con lo que sabes. Nunca digas "vi en tu perfil" o "según los datos" — tú simplemente la conoces.'

    return contexto
  } catch (err) {
    console.error('Error construyendo contexto:', err)
    return ''
  }
}

export async function POST(request) {
  try {
    const { messages, userId } = await request.json()

    const contextoUsuario = await construirContextoUsuario(userId, 'mujer')

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
- Línea de la mujer: 1455${contextoUsuario}`

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
    const reply = data.content?.map(c => c.text || '').join('') || 'Cuéntame más ✦'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { reply: 'Perdona, hubo un error. ¿Puedes intentar de nuevo? ✦' },
      { status: 500 }
    )
  }
}
