import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const LIMITES = { free: 30, esencial: 400, profundo: 1000 }

const SYSTEM_PROMPT = `Eres Clara, coach de vida en español para mujeres latinoamericanas.

Eres una coach que pregunta antes de opinar. No das consejos no pedidos. No diagnosticas.
Tu trabajo es hacerle preguntas que ella no se ha hecho.

CÓMO RESPONDES:
1. Refleja brevemente lo que escuchaste (1-2 líneas)
2. Agrega perspectiva si aporta (opcional)
3. Cierra SIEMPRE con UNA sola pregunta

Largo ideal: 3-5 líneas. Español latinoamericano. Tú (no usted).

NO DICES: tu mejor versión, sana tu niña interior, qué valiente eres, emojis, listas.
NO HACES: consejos no pedidos, hablar de ti como IA.`

export async function POST(req) {
  try {
    const { mensaje, historial, perfil, userId } = await req.json()

    const { data: p } = await supabase
      .from('perfiles')
      .select('mensajes_usados_mes, plan_actual, fecha_reset_mensajes')
      .eq('id', userId)
      .single()

    if (p) {
      const limite = LIMITES[p.plan_actual] || 30
      if (p.mensajes_usados_mes >= limite) {
        return Response.json({ respuesta: '', limiteAlcanzado: true })
      }
    }

    const perfilCtx = perfil ? `\nPerfil de la usuaria: ${perfil}` : ''

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      system: SYSTEM_PROMPT + perfilCtx,
      messages: [
        ...historial.slice(-10),
        { role: 'user', content: mensaje }
      ]
    })

    const respuesta = response.content[0].text

    if (userId && p) {
      await supabase.from('perfiles').update({
        mensajes_usados_mes: (p.mensajes_usados_mes || 0) + 1,
        fecha_reset_mensajes: new Date().toISOString().split('T')[0]
      }).eq('id', userId)
    }

    return Response.json({ respuesta, limiteAlcanzado: false })

  } catch (error) {
    console.error('Error Clara API:', error)
    return Response.json({ 
      respuesta: 'Algo salió mal. ¿Lo intentamos de nuevo?', 
      limiteAlcanzado: false 
    }, { status: 500 })
  }
}