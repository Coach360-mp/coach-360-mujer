import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const hoy = new Date().toISOString().split('T')[0]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://holaclara.app'
    const resultados = {}

    // 1. Bajar planes vencidos a free
    const { data: vencidos } = await supabase
      .from('perfiles')
      .select('id')
      .not('plan_actual', 'eq', 'free')
      .not('fecha_fin_plan', 'is', null)
      .lt('fecha_fin_plan', hoy)

    if (vencidos?.length > 0) {
      await supabase.from('perfiles').update({ plan_actual: 'free' }).in('id', vencidos.map(v => v.id))
    }
    resultados.vencidos = vencidos?.length || 0

    // 2. Email dia 7
    const hace7 = new Date()
    hace7.setDate(hace7.getDate() - 7)
    const fecha7 = hace7.toISOString().split('T')[0]

    const { data: candidatas } = await supabase
      .from('perfiles')
      .select('id, nombre, email, perfil_test_entrada, mensajes_usados_mes')
      .eq('email_carta_dia7_enviado', false)
      .gte('created_at', fecha7 + 'T00:00:00')
      .lte('created_at', fecha7 + 'T23:59:59')

    let emailsDia7 = 0
    for (const u of (candidatas || [])) {
      if (!u.email) continue
      try {
        const usaApp = (u.mensajes_usados_mes || 0) > 3
        const nombre = u.nombre || u.email.split('@')[0]
        const perfilTextos = {
          cumplidora_cansada: 'Cumplidora Cansada',
          cuida_a_todos: 'La que Cuida a Todos',
          no_se_reconoce: 'La que No se Reconoce',
          escucha_el_cuerpo: 'La que Escucha el Cuerpo',
          la_que_busca: 'La que Busca',
        }
        const perfilNombre = perfilTextos[u.perfil_test_entrada] || ''
        const asunto = usaApp
          ? `${nombre}, llevas 7 dias con Clara.`
          : `${nombre}, Clara te esta esperando.`
        const cuerpo = usaApp
          ? `Han pasado 7 dias desde que llegaste${perfilNombre ? ' como ' + perfilNombre : ''}. Ya tuviste conversaciones reales con Clara y empezaste a moverte.<br><br>Que ha cambiado? Puede ser algo pequeño: una conversacion que te hizo pensar diferente, un momento de pausa que antes no te dabas.<br><br>Eso tambien es progreso.`
          : `Llegaste hace 7 dias y Clara lleva 7 dias esperando conocerte.<br><br>No necesitas tener nada resuelto para empezar. Solo abre la app y escribe lo que tengas, aunque sea un no se por donde empezar.<br><br>Eso es suficiente.`

        const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#FAFAF7;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;padding:40px 20px;"><tr><td align="center"><table width="100%" style="max-width:480px;"><tr><td style="padding-bottom:32px;text-align:center;"><div style="font-family:Georgia,serif;font-style:italic;font-size:28px;color:#2A2520;">Clara</div><div style="height:1px;background:#C9A96E;margin:4px auto;width:40px;"></div></td></tr><tr><td style="background:#fff;border-radius:20px;padding:36px;border:0.5px solid rgba(42,37,32,0.08);"><p style="font-family:Georgia,serif;font-style:italic;font-size:20px;color:#2A2520;margin:0 0 20px;">' + asunto.replace(nombre + ', ', '') + '</p><p style="font-family:Arial,sans-serif;font-size:14px;color:#6B6057;line-height:1.8;margin:0 0 24px;">' + cuerpo + '</p><table width="100%"><tr><td align="center"><a href="' + appUrl + '/holaclara/chat" style="display:inline-block;padding:14px 36px;background:#2A2520;color:#FAFAF7;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;">' + (usaApp ? 'Seguir con Clara' : 'Hablar con Clara') + '</a></td></tr></table></td></tr><tr><td style="padding-top:24px;text-align:center;"><p style="font-family:Arial,sans-serif;font-size:11px;color:#9A8F84;margin:0;">Hola Clara &middot; <a href="mailto:hola@holaclara.app" style="color:#C9A96E;">hola@holaclara.app</a></p></td></tr></table></td></tr></table></body></html>'

        await fetch(`${appUrl}/api/holaclara/email-bienvenida`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: u.email, nombre, html_override: html, subject_override: asunto }),
        }).catch(() => {})

        await supabase.from('perfiles').update({ email_carta_dia7_enviado: true }).eq('id', u.id)
        emailsDia7++
      } catch(e) { console.error('Error email dia7:', u.id, e) }
    }
    resultados.emails_dia7 = emailsDia7

    return Response.json({ ok: true, ...resultados })

  } catch (error) {
    console.error('Cron error:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
