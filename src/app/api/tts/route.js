import { NextResponse } from 'next/server'

// Voces estándar de Google Cloud TTS que SIEMPRE están disponibles
// Cada coach tiene una voz distinta para diferenciarse
const voiceMap = {
  clara:    { name: 'es-US-Neural2-A', pitch: 2.0,  speakingRate: 1.0  },
  sofia:    { name: 'es-US-Neural2-A', pitch: 0.0,  speakingRate: 0.95 },
  victoria: { name: 'es-US-Neural2-A', pitch: -2.0, speakingRate: 0.9  },
}

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin()
  const resend = getResend()
  try {
    const { text, coach = 'clara' } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto requerido' }, { status: 400 })
    }

    const voice = voiceMap[coach] || voiceMap.clara
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY

    if (!apiKey) {
      console.error('GOOGLE_CLOUD_API_KEY no configurada')
      return NextResponse.json({ error: 'TTS no configurado' }, { status: 500 })
    }

    const requestBody = {
      input: { text: text.substring(0, 5000) },
      voice: {
        languageCode: 'es-US',
        name: voice.name,
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: voice.pitch,
        speakingRate: voice.speakingRate,
      },
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Google TTS error:', data)
      return NextResponse.json(
        { error: data.error?.message || 'Google TTS rechazó la solicitud' },
        { status: response.status }
      )
    }

    if (data.audioContent) {
      return NextResponse.json({ audio: data.audioContent })
    }

    return NextResponse.json({ error: 'No se generó audio' }, { status: 500 })
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json(
      { error: error.message || 'TTS falló' },
      { status: 500 }
    )
  }
}
