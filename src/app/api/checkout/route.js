import { NextResponse } from 'next/server'

const plans = {
  // === PLANES UNIFICADOS COACH 360 ===
  esencial: {
    title: 'Coach 360 - Plan Esencial',
    description: 'Una vertical completa. Conversaciones ilimitadas, todos los tests, módulos y herramientas.',
    price: 9990,
    currency: 'CLP',
    type: 'subscription',
  },
  premium: {
    title: 'Coach 360 - Plan Premium',
    description: 'Las 3 verticales completas (Mujer, General, Líderes) con memoria cruzada entre coaches.',
    price: 19990,
    currency: 'CLP',
    type: 'subscription',
  },

  // === SESIONES HUMANAS PERSONALES (Mujer/General) ===
  sesion_personal_1: {
    title: 'Sesión con Coach Humana (1 sesión)',
    description: 'Sesión 1:1 de 60 minutos con una coach profesional certificada.',
    price: 19990,
    currency: 'CLP',
    type: 'session',
  },
  sesion_personal_4: {
    title: 'Pack 4 Sesiones - Coach Personal',
    description: '4 sesiones 1:1 de 60 minutos con una coach profesional certificada.',
    price: 74990,
    currency: 'CLP',
    type: 'session',
  },
  sesion_personal_8: {
    title: 'Pack 8 Sesiones - Coach Personal',
    description: '8 sesiones 1:1 de 60 minutos con una coach profesional certificada.',
    price: 139990,
    currency: 'CLP',
    type: 'session',
  },

  // === SESIONES HUMANAS EJECUTIVAS (Líderes) ===
  sesion_ejecutiva_1: {
    title: 'Sesión Ejecutiva (1 sesión)',
    description: 'Sesión 1:1 de 60 minutos con un coach ejecutivo certificado.',
    price: 29990,
    currency: 'CLP',
    type: 'session',
  },
  sesion_ejecutiva_4: {
    title: 'Pack 4 Sesiones Ejecutivas',
    description: '4 sesiones 1:1 de 60 minutos con coaching ejecutivo profesional.',
    price: 109990,
    currency: 'CLP',
    type: 'session',
  },
  sesion_ejecutiva_8: {
    title: 'Pack 8 Sesiones Ejecutivas',
    description: '8 sesiones 1:1 de 60 minutos con coaching ejecutivo profesional.',
    price: 209990,
    currency: 'CLP',
    type: 'session',
  },

  // === LEGACY (por compatibilidad con versiones anteriores) ===
  sesion_1: {
    title: 'Sesión con Coach Humana',
    description: 'Sesión 1:1 de 60 minutos.',
    price: 19990,
    currency: 'CLP',
    type: 'session',
  },
  sesion_4: {
    title: 'Pack 4 Sesiones',
    description: '4 sesiones 1:1.',
    price: 74990,
    currency: 'CLP',
    type: 'session',
  },
  sesion_8: {
    title: 'Pack 8 Sesiones',
    description: '8 sesiones 1:1.',
    price: 139990,
    currency: 'CLP',
    type: 'session',
  },
}

export async function POST(request) {
  try {
    const { planId, userId, userEmail, vertical } = await request.json()
    const plan = plans[planId]

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 400 })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coach-360-mujer.vercel.app'

    // Redirect back to the right vertical dashboard after payment
    const verticalPath = vertical && ['general', 'lideres'].includes(vertical)
      ? `/${vertical}/dashboard`
      : '/dashboard'

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
        success: `${baseUrl}${verticalPath}?payment=success&plan=${planId}`,
        failure: `${baseUrl}${verticalPath}?payment=failure`,
        pending: `${baseUrl}${verticalPath}?payment=pending`,
      },
      auto_return: 'approved',
      external_reference: `${userId}_${planId}_${vertical || 'mujer'}_${Date.now()}`,
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
