export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const ahora = new Date()
    const diaSemana = ahora.getDay() // 0=domingo, 1=lunes
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://micoach360.com'

    const { data: perfiles } = await supabaseAdmin
      .from('perfiles')
      .select('id, email, nombre, current_vertical, plan_actual, created_at, racha_dias')
      .not('email', 'is', null)

    const enviados = []

    for (const perfil of perfiles || []) {
      const vertical = perfil.current_vertical || 'mujer'
      const diasDesdeRegistro = Math.floor((ahora - new Date(perfil.created_at)) / (1000 * 60 * 60 * 24))

      // RESUMEN SEMANAL — solo los lunes si tuvo actividad
      if (diaSemana === 1 && perfil.racha_dias > 0) {
        const { data: yaEnviado } = await supabaseAdmin
          .from('user_context').select('id')
          .eq('user_id', perfil.id).eq('context_key', 'email_semanal_enviado')
          .gte('created_at', new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 1).toISOString())
          .maybeSingle()

        if (!yaEnviado) {
          try {
            const res = await fetch(`${APP_URL}/api/emails/engagement`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: perfil.id, vertical, tipo: 'semanal' })
            })
            if (res.ok) enviados.push({ userId: perfil.id, tipo: 'semanal' })
          } catch (e) { console.error('Error semanal:', e) }
        }
      }

      // UPGRADE ESENCIAL — día 5, plan free, activo
      if (diasDesdeRegistro === 5 && perfil.plan_actual === 'free' && perfil.racha_dias >= 2) {
        const { data: yaEnviado } = await supabaseAdmin
          .from('user_context').select('id')
          .eq('user_id', perfil.id).eq('context_key', 'email_esencial_enviado')
          .maybeSingle()

        if (!yaEnviado) {
          try {
            const res = await fetch(`${APP_URL}/api/emails/engagement`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: perfil.id, vertical, tipo: 'esencial' })
            })
            if (res.ok) enviados.push({ userId: perfil.id, tipo: 'esencial' })
          } catch (e) { console.error('Error esencial:', e) }
        }
      }

      // UPGRADE PREMIUM — día 14, plan esencial, activo
      if (diasDesdeRegistro === 14 && perfil.plan_actual === 'esencial' && perfil.racha_dias >= 3) {
        const { data: yaEnviado } = await supabaseAdmin
          .from('user_context').select('id')
          .eq('user_id', perfil.id).eq('context_key', 'email_premium_enviado')
          .maybeSingle()

        if (!yaEnviado) {
          try {
            const res = await fetch(`${APP_URL}/api/emails/engagement`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: perfil.id, vertical, tipo: 'premium' })
            })
            if (res.ok) enviados.push({ userId: perfil.id, tipo: 'premium' })
          } catch (e) { console.error('Error premium:', e) }
        }
      }
    }

    return NextResponse.json({ success: true, enviados: enviados.length, detalle: enviados })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
