import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const { email, nombre, perfil, html_override, subject_override } = await req.json()

    if (!email) return Response.json({ error: 'Falta email' }, { status: 400 })

    const nombreMostrar = nombre || email.split('@')[0]

    const perfilTextos = {
      cumplidora_cansada: 'La Cumplidora Cansada',
      cuida_a_todos: 'La que Cuida a Todos',
      no_se_reconoce: 'La que No se Reconoce',
      escucha_el_cuerpo: 'La que Escucha el Cuerpo',
      la_que_busca: 'La que Busca',
    }
    const perfilTexto = perfilTextos[perfil] || 'tú misma'

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenida a Hola Clara</title>
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
              <p style="font-family:Georgia,serif;font-style:italic;font-size:26px;color:#2A2520;margin:0 0 16px;line-height:1.2;">Hola, ${nombreMostrar}.</p>
              <p style="font-family:Arial,sans-serif;font-size:15px;color:#2A2520;line-height:1.7;margin:0 0 16px;opacity:0.75;">
                Ya estás adentro. Clara te está esperando.
              </p>
              <p style="font-family:Arial,sans-serif;font-size:15px;color:#2A2520;line-height:1.7;margin:0 0 24px;opacity:0.75;">
                Tu perfil dice que eres <strong>${perfilTexto}</strong>. Clara ya sabe cómo acompañarte desde ahí.
              </p>

              <!-- DIVIDER -->
              <div style="height:1px;background:rgba(42,37,32,0.08);margin:24px 0;"></div>

              <p style="font-family:Arial,sans-serif;font-size:13px;color:#2A2520;line-height:1.7;margin:0 0 24px;opacity:0.5;">
                No tienes que prepararte ni saber qué decir. Solo abre la app cuando lo necesites y empieza con lo que tengas.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://holaclara.app/holaclara/chat" style="display:inline-block;padding:14px 36px;background:#2A2520;color:#FAFAF7;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:0.5px;">
                      Hablar con Clara →
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
                Recibiste este correo porque te registraste en holaclara.app<br>
                <a href="https://holaclara.app/holaclara/planes" style="color:#C9A96E;text-decoration:none;">Ver planes</a>
                &nbsp;·&nbsp;
                <a href="mailto:hola@holaclara.app" style="color:#C9A96E;text-decoration:none;">Contacto</a>
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
      subject: subject_override || ('Ya estas adentro, ' + nombreMostrar + '.'),
      html: html_override || html,
    })

    if (error) {
      console.error('Resend error:', error)
      return Response.json({ error }, { status: 500 })
    }

    return Response.json({ ok: true, id: data?.id })

  } catch (error) {
    console.error('Email bienvenida error:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
