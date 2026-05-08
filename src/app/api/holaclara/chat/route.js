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

    // Contexto de actividad reciente
    const hoy = new Date().toISOString().split('T')[0]
    let actividadCtx = ''

    if (userId) {
      const [{ data: rituales }, { data: journaling }, { data: habitos }, { data: ciclo }, { data: perfilData }] = await Promise.all([
        supabase.from('rituales_completados').select('ritual_id, tipo, datos').eq('user_id', userId).eq('fecha', hoy).limit(5),
        supabase.from('journaling_entradas').select('plantilla_id, datos').eq('user_id', userId).eq('fecha', hoy).limit(3),
        supabase.from('habitos_usuario').select('nombre, dimension').eq('user_id', userId).eq('activo', true),
        supabase.from('registro_ciclo').select('fase, sintomas').eq('usuario_id', userId).eq('fecha', hoy).maybeSingle(),
        supabase.from('perfiles').select('fase_ciclo_actual, perfil_test_entrada').eq('id', userId).single(),
      ])

      const partes = []

      if (perfilData?.perfil_test_entrada) {
        partes.push(`Perfil de entrada: ${perfilData.perfil_test_entrada}`)
      }

      if (perfilData?.fase_ciclo_actual) {
        const faseNombres = { mens: 'menstrual', fol: 'folicular', ov: 'ovulación', lut: 'lútea' }
        partes.push(`Fase del ciclo actual: ${faseNombres[perfilData.fase_ciclo_actual] || perfilData.fase_ciclo_actual}`)
      }

      if (ciclo?.sintomas?.length > 0) {
        partes.push(`Cómo está hoy: ${ciclo.sintomas.join(', ')}`)
      }

      if (habitos?.length > 0) {
        partes.push(`Sus hábitos activos: ${habitos.map(h => h.nombre).join(', ')}`)
      }

      if (rituales?.length > 0) {
        const nombresRituales = rituales.map(r => r.ritual_id.replace(/_/g, ' ')).join(', ')
        partes.push(`Rituales que hizo hoy: ${nombresRituales}`)
      }

      if (journaling?.length > 0) {
        const entradas = journaling.map(j => {
          if (j.plantilla_id === 'volcado_mental' && j.datos?.texto) return `volcado mental: "${j.datos.texto.slice(0, 100)}"`
          if (j.plantilla_id === 'tres_cosas_hoy') return `journaling de 3 cosas (qué pasó, sentiste, aprendiste)`
          if (j.plantilla_id === 'semana_5_frases') return `cierre semanal en 5 frases`
          return j.plantilla_id
        })
        partes.push(`Journaling de hoy: ${entradas.join(', ')}`)
      }

      if (partes.length > 0) {
        actividadCtx = '\n\nCONTEXTO DE LA USUARIA HOY:\n' + partes.join('\n')
        actividadCtx += '\n\nUsa este contexto con naturalidad cuando sea relevante. No lo menciones todo de golpe. Si hizo un ritual o journaling hoy, puedes referirte a eso con delicadeza.'
      }
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      system: SYSTEM_PROMPT + perfilCtx + actividadCtx,
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