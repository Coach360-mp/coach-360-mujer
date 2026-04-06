import { NextResponse } from 'next/server'

const voiceMap = {
  clara: { name: 'es-US-Studio-A', ssmlGender: 'FEMALE', pitch: 2, speakingRate: 1.0 },
  sofia: { name: 'es-US-Neural2-A', ssmlGender: 'FEMALE', pitch: 0, speakingRate: 0.95 },
  victoria: { name: 'es-US-Wavenet-A', ssmlGender: 'FEMALE', pitch: -2, speakingRate: 0.9 },
}

export async function POST(request) {
  try {
    const { text, coach = 'clara' } = await request.json()
    const voice = voiceMap[coach] || voiceMap.clara
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'TTS not configured' }, { status: 500 })
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'es-US',
            name: voice.name,
            ssmlGender: voice.ssmlGender,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: voice.pitch,
            speakingRate: voice.speakingRate,
          },
        }),
      }
    )

    const data = await response.json()

    if (data.audioContent) {
      return NextResponse.json({ audio: data.audioContent })
    } else {
      return NextResponse.json({ error: 'No audio generated' }, { status: 500 })
    }
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }
}
