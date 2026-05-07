import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const PLAN_NOMBRES = {
  esencial: 'Esencial',
  profundo: 'Profundo',
}

const PLAN_PRECIOS = {
  esencial_mensual: '$9.990 CLP/mes',
  esencial_anual: '$99.900 CLP/año',
  profundo_mensual: '$19.990 CLP/mes',
  profundo_anual: '$199.900 CLP/año',
}

export async function POST(req) {
  try {
    const { email, nombre, plan, billing, paymentId } = await req.json()

    if (!email || !plan) return Response.json({ error: 'Faltan parámetros' }, { status: 400 })

    const nombreMostrar = nombre || email.split('@')[0]
    const planNombre = PLAN_NOMBRES[plan] || plan
    const precioTexto = PLAN_PRECIOS[`${plan}_${billing || 'mensual'}`] || ''

    const hoy = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de pago — Hola Clara</title>
</head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- LOGO -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <div style="font-family:Georgia,serif;font-style:italic;font-size:28px;color:#2A2520;line-height:1;">Clara</div>
              <div style="height:1px;background:#C9A96E;margin:4px auto;width:48px;"></div>
              <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2px;color:#9A8F84;text-transform:uppercase;">Para la que quiere más y necesita parar.</div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#fff;border-radius:20px;padding:40px 36px;border:0.5px solid rgba(42,37,32,0.08);">
              <p style="font-family:Georgia,serif;font-style:italic;font-size:24px;color:#2A2520;margin:0 0 16px;line-height:1.2;">Tu pago fue confirmado.</p>
              <p style="font-family:Arial,sans-serif;font-size:15px;color:#2A2520;line-height:1.7;margin:0 0 24px;opacity:0.75;">
                Hola ${nombreMostrar}, tu plan <strong>${planNombre}</strong> está activo. Clara ya tiene acceso a todo lo que incluye tu plan.
              </p>

              <!-- RESUMEN PAGO -->
              <div style="background:#F5EFE6;border-radius:14px;padding:20px 24px;margin-bottom:24px;border-left:3px solid #C9A96E;">
                <p style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;opacity:0.4;margin:0 0 12px;font-weight:700;">Resumen</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:13px;color:#2A2520;opacity:0.6;padding-bottom:6px;">Plan</td>
                    <td style="font-family:Arial,sans-serif;font-size:13px;color:#2A2520;font-weight:700;text-align:right;padding-bottom:6px;">Hola Clara ${planNombre}</td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:13px;color:#2A2520;opacity:0.6;padding-bottom:6px;">Monto</td>
                    <td style="font-family:Arial,sans-serif;font-size:13px;color:#2A2520;font-weight:700;text-align:right;padding-bottom:6px;">${precioTexto}</td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:13px;color:#2A2520;opacity:0.6;padding-bottom:6px;">Fecha</td>
                    <td style="font-family:Arial,sans-serif;font-size:13px;color:#2A2520;font-weight:700;text-align:right;padding-bottom:6px;">${hoy}</td>
                  </tr>
                  ${paymentId ? `<tr>
                    <td style="font-family:Arial,sans-serif;font-size:11px;color:#2A2520;opacity:0.4;padding-bottom:0;">ID de pago</td>
                    <td style="font-family:Arial,sans-serif;font-size:11px;color:#2A2520;opacity:0.4;text-align:right;">${paymentId}</td>
                  </tr>` : ''}
                </table>
              </div>

              <p style="font-family:Arial,sans-serif;font-size:13px;color:#2A2520;line-height:1.7;margin:0 0 24px;opacity:0.5;">
                Tienes garantía de 7 días. Si no es para ti, escríbenos a hola@holaclara.app y te devolvemos todo, sin preguntas.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://holaclara.app/holaclara/chat" style="display:inline-block;padding:14px 36px;background:#2A2520;color:#FAFAF7;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:0.5px;">
                      Ir al chat con Clara →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="font-family:Arial,sans-serif;font-size:11px;color:#9A8F84;margin:0;line-height:1.6;">
                Hola Clara · MPR Studio SpA<br>
                <a href="mailto:hola@holaclara.app" style="color:#C9A96E;text-decoration:none;">hola@holaclara.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    const { data, error } = await resend.emails.send({
      from: 'Clara <hola@holaclara.app>',
      to: email,
      subject: `Tu plan ${planNombre} está activo.`,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return Response.json({ error }, { status: 500 })
    }

    return Response.json({ ok: true, id: data?.id })

  } catch (error) {
    console.error('Email pago error:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
