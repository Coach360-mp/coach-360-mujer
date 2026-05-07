import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PRECIOS = {
  esencial_mensual: 9990,
  esencial_anual: 99900,
  profundo_mensual: 19990,
  profundo_anual: 199900,
}

const NOMBRES = {
  esencial_mensual: 'Hola Clara Esencial · mensual',
  esencial_anual: 'Hola Clara Esencial · anual (2 meses gratis)',
  profundo_mensual: 'Hola Clara Profundo · mensual',
  profundo_anual: 'Hola Clara Profundo · anual (2 meses gratis)',
}

export async function POST(req) {
  try {
    const { plan, billing, userId, email } = await req.json()

    if (!plan || !billing || !userId || !email) {
      return Response.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const key = `${plan}_${billing}`
    const monto = PRECIOS[key]
    const titulo = NOMBRES[key]

    if (!monto) {
      return Response.json({ error: 'Plan inválido' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://holaclara.app'

    const preference = new Preference(mp)
    const result = await preference.create({
      body: {
        items: [{
          title: titulo,
          quantity: 1,
          unit_price: monto,
          currency_id: 'CLP',
        }],
        payer: { email },
        back_urls: {
          success: `${appUrl}/holaclara/pago/exitoso?plan=${plan}&billing=${billing}`,
          failure: `${appUrl}/holaclara/pago/fallido`,
          pending: `${appUrl}/holaclara/pago/pendiente`,
        },
        auto_return: 'approved',
        external_reference: `${userId}|${plan}|${billing}`,
        notification_url: `${appUrl}/api/holaclara/webhook-mp`,
        metadata: { user_id: userId, plan, billing },
      }
    })

    await supabase.from('pagos_mercadopago').insert({
      user_id: userId,
      preference_id: result.id,
      plan,
      estado: 'iniciado',
      monto,
      moneda: 'CLP',
      metadata: { billing, titulo },
    })

    return Response.json({ init_point: result.init_point, preference_id: result.id })

  } catch (error) {
    console.error('Error MP:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
