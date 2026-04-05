import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { messages } = await request.json()

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
        system: `Eres Clara, la coach IA de Coach 360 Mujer. Tu rol es ayudar a mujeres a ver con más claridad, tomar mejores decisiones y vivir más alineadas con lo que realmente quieren.

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
- Línea de la mujer: 1455`,
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
