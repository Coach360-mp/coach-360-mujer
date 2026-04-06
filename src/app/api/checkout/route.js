import { NextResponse } from 'next/server'

const plans = {
  esencial: {
    title: 'Coach 360 Mujer - Plan Esencial',
    description: 'Sofía como tu coach, conversaciones ilimitadas, todos los tests y módulos',
    price: 6990,
    currency: 'CLP',
  },
  premium: {
    title: 'Coach 360 Mujer - Plan Premium',
    description: 'Victoria como tu mentora, coaching con voz, seguimiento personalizado',
    price: 19990,
    currency: 'CLP',
  },
  sesion_1: {
    title: 'Sesión con Coach Humana (1 sesión)',
    description: 'Sesión 1:1 de 60 minutos con una coach profesional certificada',
    price: 49990,
    currency: 'CLP',
  },
  sesion_4: {
    title: 'Pack 4 Sesiones con Coach Humana',
    description: '4 sesiones 1:1 de 60 minutos con una coach profesional certificada',
    price: 159990,
    currency: 'CLP',
  },
  sesion_8: {
    title: 'Pack 8 Sesiones con Coach Humana',
    description: '8 sesiones 1:1 de 60 minutos con una coach profesional certificada',
    price: 279990,
    currency: 'CLP',
  },
}

export async function POST(request) {
  try {
    const { planId, userId, userEmail } = await request.json()
    const plan = plans[planId]

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 400 })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coach-360-mujer.vercel.app'

    const preference = {
      items: [
        {
          title: plan.title,
          description: plan.description,
          quantity: 1,
          currency_id: plan.currency,
          unit_price: plan.price,
        },
      ],
      payer: {
        email: userEmail || '',
      },
      back_urls: {
        success: `${baseUrl}/dashboard?payment=success&plan=${planId}`,
        failure: `${baseUrl}/dashboard?payment=failure`,
        pending: `${baseUrl}/dashboard?payment=pending`,
      },
      auto_return: 'approved',
      external_reference: `${userId}_${planId}_${Date.now()}`,
      notification_url: `${baseUrl}/api/webhook`,
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    })

    const data = await response.json()

    if (data.init_point) {
      return NextResponse.json({ url: data.init_point })
    } else {
      console.error('MercadoPago error:', data)
      return NextResponse.json({ error: 'Could not create payment' }, { status: 500 })
    }
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
