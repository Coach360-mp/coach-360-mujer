export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { ANTHROPIC_MODEL } from '@/lib/clients'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio')
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No se recibió audio' }, { status: 400 })
    }

    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = audioFile.type || 'audio/webm'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'audio-1',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'audio',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Audio,
              },
            },
            {
              type: 'text',
              text: 'Transcribe exactamente lo que se dice en este audio en español. Responde SOLO con la transcripción, sin explicaciones ni comillas.',
            },
          ],
        }],
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Anthropic transcripcion error:', data)
      return NextResponse.json({ error: 'Error al transcribir' }, { status: 500 })
    }

    const transcripcion = data.content?.[0]?.text?.trim() || ''
    return NextResponse.json({ transcripcion })
  } catch (err) {
    console.error('Transcripcion error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
