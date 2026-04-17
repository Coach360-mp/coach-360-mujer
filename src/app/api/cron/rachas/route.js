export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Este endpoint lo llama Vercel Cron cada día a las 9am
// Configurar en vercel.json: { "crons": [{ "path": "/api/cron/rachas", "schedule": "0 12 * * *" }] }

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)
    const ayerStr = ayer.toISOString().split('T')[0]

    const haceDosDias = new Date()
    haceDosDias.setDate(haceDosDias.getDate() - 2)
    const haceDosDiasStr = haceDosDias.toISOString().split('T')[0]

    // Buscar usuarios con racha > 3 que no hicieron check-in ayer ni hoy
    const { data: checkins } = await supabaseAdmin
      .from('daily_checkins')
      .select('user_id')
      .gte('created_at', ayerStr)

    const usuariosActivos = new Set(checkins?.map(c => c.user_id) || [])

    // Buscar perfiles con racha > 3
    const { data: perfiles } = await supabaseAdmin
      .from('perfiles')
      .select('id, email, nombre, racha_dias, current_vertical')
      .gt('racha_dias', 3)
      .not('email', 'is', null)

    const envios = []
    const resultados = []

    for (const perfil of perfiles || []) {
      // Si no hizo check-in ayer
      if (!usuariosActivos.has(perfil.id)) {
        const vertical = perfil.current_vertical || 'mujer'

        // Verificar que no le hayamos enviado este email hoy
        const { data: emailEnviado } = await supabaseAdmin
          .from('user_context')
          .select('id')
          .eq('user_id', perfil.id)
          .eq('context_key', 'email_racha_enviado')
          .gte('created_at', ayerStr)
          .maybeSingle()

        if (!emailEnviado) {
          envios.push(
            fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://micoach360.com'}/api/emails/racha`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: perfil.id, vertical })
            }).then(async (res) => {
              if (res.ok) {
                await supabaseAdmin.from('user_context').insert({
                  user_id: perfil.id,
                  vertical,
                  context_key: 'email_racha_enviado',
                  context_value: new Date().toISOString(),
                  source_coach: vertical === 'mujer' ? 'clara' : vertical === 'general' ? 'leo' : 'marco',
                  cross_coach: false,
                })
                resultados.push({ userId: perfil.id, status: 'enviado' })
              }
            }).catch(e => {
              resultados.push({ userId: perfil.id, status: 'error', error: e.message })
            })
          )
        }
      }
    }

    await Promise.all(envios)

    return NextResponse.json({
      success: true,
      procesados: perfiles?.length || 0,
      emails_enviados: resultados.filter(r => r.status === 'enviado').length,
      resultados
    })
  } catch (error) {
    console.error('Error cron rachas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
