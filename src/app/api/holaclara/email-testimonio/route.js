import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const { userId } = await req.json()
    if (!userId) return Response.json({ error: 'Falta userId' }, { status: 400 })

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('created_at, nombre, email_testimonio_enviado')
      .eq('id', userId)
      .single()

    if (!perfil || perfil.email_testimonio_enviado) {
      return Response.json({ ok: true, skip: true })
    }

    const diasDesdeRegistro = Math.floor(
      (Date.now() - new Date(perfil.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diasDesdeRegistro < 14) {
      return Response.json({ ok: true, skip: true, dias: diasDesdeRegistro })
    }

    const { data: userData } = await supabase.auth.admin.getUserById(userId)
    const email = userData?.user?.email
    if (!email) return Response.json({ error: 'Sin email' }, { status: 400 })

    const nombre = perfil.nombre || 'Hola'

    await resend.emails.send({
      from: 'Clara <clara@holaclara.app>',
      to: email,
      subject: `${nombre}, ¿cómo ha sido tu experiencia con Clara?`,
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:'Inter Tight',sans-serif;color:#2A2520;background:#FAFAF7;padding:40px 24px;">
          <div style="font-family:Georgia,serif;font-style:italic;font-size:24px;margin-bottom:4px;">Clara</div>
          <div style="height:1px;background:#C9A96E;width:40px;margin-bottom:32px;"></div>

          <p style="font-family:Georgia,serif;font-style:italic;font-size:20px;margin-bottom:16px;">
            ${nombre}, llevas 14 días con nosotras.
          </p>

          <p style="font-size:14px;line-height:1.7;color:#6B6057;margin-bottom:16px;">
            Quiero preguntarte algo directamente: ¿qué ha cambiado en estas dos semanas?
            No tiene que ser grande. Puede ser una sola cosa — una conversación que te hizo pensar diferente, un hábito que sostuviste, una pregunta que no te habías hecho.
          </p>

          <p style="font-size:14px;line-height:1.7;color:#6B6057;margin-bottom:32px;">
            Me importa saberlo. Y si te parece bien, me gustaría compartir tu experiencia con otras mujeres que están donde tú estabas hace 14 días.
          </p>

          <a href="mailto:clara@holaclara.app?subject=Mi experiencia con Clara" style="display:block;width:100%;padding:14px;border-radius:10px;background:#2A2520;color:#FAFAF7;font-size:14px;font-weight:700;text-align:center;text-decoration:none;margin-bottom:16px;">
            Contarle a Clara →
          </a>

          <p style="font-size:12px;color:#9A8F84;line-height:1.6;margin-bottom:32px;">
            También puedes compartir Hola Clara con una amiga que lo necesite:
            <a href="https://holaclara.app" style="color:#C9A96E;">holaclara.app</a>
          </p>

          <p style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:#2A2520;">
            Con cariño,<br/>Clara
          </p>
        </div>
      `
    })

    // Marcar como enviado
    await supabase.from('perfiles').update({ email_testimonio_enviado: true }).eq('id', userId)

    return Response.json({ ok: true, enviado: true })
  } catch (error) {
    console.error('Error email testimonio:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
