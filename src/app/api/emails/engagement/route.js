import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const COACHES = {
  mujer: { nombre: 'Clara', email: 'clara@micoach360.com', color: '#d4af37', colorText: '#1a1a1a' },
  general: { nombre: 'Leo', email: 'leo@micoach360.com', color: '#14b8a6', colorText: '#ffffff' },
  lideres: { nombre: 'Marco', email: 'marco@micoach360.com', color: '#7C3AED', colorText: '#ffffff' },
}

// ── RESUMEN SEMANAL ──
function emailResumenHTML({ nombre, vertical, racha, nivel, puntos, habitosCompletados, habitosTotal }) {
  const c = COACHES[vertical] || COACHES.mujer

  const textos = {
    mujer: `<p>Esta semana estuviste presente. Eso importa.</p>`,
    general: `<p>Los números no mienten. Esta semana:</p>`,
    lideres: `<p>El reporte de tu semana como líder:</p>`,
  }

  const cierres = {
    mujer: `<p>La semana que viene tiene 7 días nuevos. ¿Qué vas a elegir hacer diferente?</p>`,
    general: `<p>¿Qué vas a cambiar esta semana para mejorar esos números?</p>`,
    lideres: `<p>Un líder que revisa sus datos toma mejores decisiones. ¿Qué ajustas esta semana?</p>`,
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background-color:#f9f6f1; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f6f1; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
        <tr>
          <td style="background-color:#1a1a1a; padding: 32px 40px; border-radius: 16px 16px 0 0; text-align:center;">
            <p style="margin:0; color:${c.color}; font-size:13px; letter-spacing:3px; text-transform:uppercase;">COACH 360</p>
            <h1 style="margin:12px 0 0; color:#ffffff; font-size:22px; font-weight:300;">${c.nombre} aquí. Tu semana ✦</h1>
          </td>
        </tr>
        <tr>
          <td style="background-color:#ffffff; padding: 40px; border-left: 1px solid #ede8e0; border-right: 1px solid #ede8e0;">
            <p style="margin:0 0 16px; color:#1a1a1a; font-size:17px; line-height:1.7;">Hola, <strong>${nombre}</strong>.</p>
            <div style="color:#444; font-size:15px; line-height:1.8;">${textos[vertical] || textos.mujer}</div>

            <!-- Stats -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
              <tr>
                <td style="text-align:center; padding: 16px; background:#f9f6f1; border-radius:12px;">
                  <p style="margin:0; font-size:32px; font-weight:700; color:${c.color};">${racha}</p>
                  <p style="margin:4px 0 0; font-size:12px; color:#888;">días de racha</p>
                </td>
                <td style="width:12px;"></td>
                <td style="text-align:center; padding: 16px; background:#f9f6f1; border-radius:12px;">
                  <p style="margin:0; font-size:32px; font-weight:700; color:${c.color};">${nivel}</p>
                  <p style="margin:4px 0 0; font-size:12px; color:#888;">nivel</p>
                </td>
                <td style="width:12px;"></td>
                <td style="text-align:center; padding: 16px; background:#f9f6f1; border-radius:12px;">
                  <p style="margin:0; font-size:32px; font-weight:700; color:${c.color};">${habitosCompletados}/${habitosTotal}</p>
                  <p style="margin:4px 0 0; font-size:12px; color:#888;">hábitos</p>
                </td>
              </tr>
            </table>

            <div style="color:#444; font-size:15px; line-height:1.8;">${cierres[vertical] || cierres.mujer}</div>

            <div style="text-align:center; margin:36px 0;">
              <a href="https://micoach360.com" style="background-color:${c.color}; color:${c.colorText}; padding:16px 40px; border-radius:50px; text-decoration:none; font-size:15px; font-weight:600; display:inline-block;">Ver mi progreso →</a>
            </div>
            <p style="color:#888; font-size:14px; margin:0;">${c.nombre} ✦</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f0ebe3; padding: 24px 40px; border-radius: 0 0 16px 16px; border: 1px solid #ede8e0; border-top:none;">
            <p style="margin:0; color:#888; font-size:13px; line-height:1.8;">
              <strong style="color:#444;">María Paz Reveco</strong>, fundadora de Coach 360<br>
              <em style="color:${c.color};">"Elige tu mejor versión, cada día."</em><br>
              <a href="https://micoach360.com" style="color:#888; text-decoration:none;">micoach360.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── UPGRADE ──
function emailUpgradeHTML({ nombre, vertical, tipo }) {
  const c = COACHES[vertical] || COACHES.mujer

  const textos = {
    esencial: {
      mujer: { asunto: `Clara aquí. Hay más de lo que has visto ✦`, cuerpo: `<p>Llevas 5 días en Coach 360. Has hecho check-ins, quizás un test, quizás una conversación conmigo.</p><p>Pero hay cosas que todavía no has visto.</p><p>Con el plan Esencial: conversaciones ilimitadas conmigo, todos los tests y herramientas, todos los módulos.</p><p>Cada día es una oportunidad de elegir tu mejor versión. El plan Esencial te da todas las herramientas para hacerlo.</p>` },
      general: { asunto: `Leo aquí. El plan gratis tiene un límite.`, cuerpo: `<p>5 días en Coach 360. Ya sabes de qué se trata.</p><p>El plan Esencial elimina los límites: conversaciones ilimitadas, todos los tests, todas las herramientas.</p><p>Si en 5 días ya viste valor, el plan completo lo multiplica. Decisión tuya.</p>` },
      lideres: { asunto: `Marco aquí. El acceso completo cambia el resultado.`, cuerpo: `<p>5 días en Coach 360 Líderes.</p><p>El plan Esencial te da acceso completo: todos los diagnósticos ejecutivos, todos los frameworks, conversaciones ilimitadas conmigo.</p><p>Para un líder, eso es menos de lo que cuesta una mala decisión.</p>` },
    },
    premium: {
      mujer: { asunto: `Clara aquí. El siguiente nivel existe ✦`, cuerpo: `<p>Llevas dos semanas trabajando con Coach 360.</p><p>El plan Premium te da acceso a las 3 verticales: trabajo conmigo en autoconocimiento, con Leo en hábitos y propósito, y con Marco en liderazgo. Los tres te conocemos.</p><p>Tu mejor versión no tiene un solo ángulo.</p>` },
      general: { asunto: `Leo aquí. Hay un nivel más.`, cuerpo: `<p>Dos semanas trabajando en hábitos y propósito.</p><p>El plan Premium te conecta también con Clara (autoconocimiento) y Marco (liderazgo). Los tres te conocemos y compartimos lo que aprendemos de ti.</p><p>Tu mejor versión no se construye en un solo eje.</p>` },
      lideres: { asunto: `Marco aquí. El liderazgo completo requiere conocerse completo.`, cuerpo: `<p>Dos semanas trabajando en liderazgo ejecutivo.</p><p>El plan Premium te conecta con Clara (autoconocimiento) y Leo (hábitos y propósito), además de conmigo. Los tres compartimos lo que aprendemos de ti.</p><p>Un líder que se conoce en todas sus dimensiones toma mejores decisiones. Eso no es filosofía — es neurociencia.</p>` },
    },
  }

  const t = textos[tipo][vertical]

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background-color:#f9f6f1; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f6f1; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
        <tr>
          <td style="background-color:#1a1a1a; padding: 32px 40px; border-radius: 16px 16px 0 0; text-align:center;">
            <p style="margin:0; color:${c.color}; font-size:13px; letter-spacing:3px; text-transform:uppercase;">COACH 360 · ${tipo === 'esencial' ? 'ESENCIAL' : 'PREMIUM'}</p>
            <h1 style="margin:12px 0 0; color:#ffffff; font-size:22px; font-weight:300;">${c.nombre} ✦</h1>
          </td>
        </tr>
        <tr>
          <td style="background-color:#ffffff; padding: 40px; border-left: 1px solid #ede8e0; border-right: 1px solid #ede8e0;">
            <p style="margin:0 0 16px; color:#1a1a1a; font-size:17px; line-height:1.7;">Hola, <strong>${nombre}</strong>.</p>
            <div style="color:#444; font-size:15px; line-height:1.8;">${t.cuerpo}</div>
            <div style="text-align:center; margin:36px 0;">
              <a href="https://micoach360.com" style="background-color:${c.color}; color:${c.colorText}; padding:16px 40px; border-radius:50px; text-decoration:none; font-size:15px; font-weight:600; display:inline-block;">Ver planes →</a>
            </div>
            <p style="color:#888; font-size:14px; margin:0;">${c.nombre} ✦</p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f0ebe3; padding: 24px 40px; border-radius: 0 0 16px 16px; border: 1px solid #ede8e0; border-top:none;">
            <p style="margin:0; color:#888; font-size:13px; line-height:1.8;">
              <strong style="color:#444;">María Paz Reveco</strong>, fundadora de Coach 360<br>
              <em style="color:${c.color};">"Elige tu mejor versión, cada día."</em><br>
              <a href="https://micoach360.com" style="color:#888; text-decoration:none;">micoach360.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(request) {
  try {
    const { userId, vertical = 'mujer', tipo } = await request.json()
    if (!userId || !tipo) return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })

    const { data: perfil } = await supabaseAdmin
      .from('perfiles')
      .select('nombre, email, racha_dias, nivel, puntos_totales')
      .eq('id', userId).single()

    if (!perfil?.email) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const c = COACHES[vertical] || COACHES.mujer
    const nombre = perfil.nombre || 'hola'

    let subject, html

    if (tipo === 'semanal') {
      // Contar hábitos completados esta semana
      const hace7 = new Date(); hace7.setDate(hace7.getDate() - 7)
      const { data: habitos } = await supabaseAdmin.from('habitos_usuario').select('id').eq('user_id', userId).eq('activo', true)
      const { data: completados } = await supabaseAdmin.from('habitos_completados').select('habito_id').eq('user_id', userId).gte('fecha', hace7.toISOString().split('T')[0])

      const uniqueCompletados = new Set(completados?.map(h => h.habito_id) || [])

      subject = `${c.nombre} aquí. Tu semana en Coach 360 ✦`
      html = emailResumenHTML({
        nombre, vertical,
        racha: perfil.racha_dias || 0,
        nivel: perfil.nivel || 1,
        puntos: perfil.puntos_totales || 0,
        habitosCompletados: uniqueCompletados.size,
        habitosTotal: habitos?.length || 0,
      })
    } else if (tipo === 'esencial' || tipo === 'premium') {
      const t = { esencial: { mujer: { asunto: `Clara aquí. Hay más de lo que has visto ✦` }, general: { asunto: `Leo aquí. El plan gratis tiene un límite.` }, lideres: { asunto: `Marco aquí. El acceso completo cambia el resultado.` } }, premium: { mujer: { asunto: `Clara aquí. El siguiente nivel existe ✦` }, general: { asunto: `Leo aquí. Hay un nivel más.` }, lideres: { asunto: `Marco aquí. El liderazgo completo requiere conocerse completo.` } } }
      subject = t[tipo][vertical].asunto
      html = emailUpgradeHTML({ nombre, vertical, tipo })
    } else {
      return NextResponse.json({ error: 'tipo inválido' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: `${c.nombre} de Coach 360 <${c.email}>`,
      to: perfil.email,
      subject,
      html,
    })

    if (error) return NextResponse.json({ error }, { status: 500 })

    await supabaseAdmin.from('user_context').insert({
      user_id: userId, vertical,
      context_key: `email_${tipo}_enviado`,
      context_value: new Date().toISOString(),
      source_coach: c.nombre.toLowerCase(),
      cross_coach: false,
    })

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
