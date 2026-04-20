export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'


const PAISES_SOPORTADOS = ['CL', 'AR', 'CO']
const PAIS_DEFAULT = 'CL'

const planesMetadata = {
  esencial: {
    title: 'Coach 360 - Plan Esencial',
    description: 'Una vertical completa. Conversaciones ilimitadas, todos los tests, módulos y herramientas.',
    type: 'subscription',
  },
  premium: {
    title: 'Coach 360 - Plan Premium',
    description: 'Las 3 verticales completas (Mujer, General, Líderes) con memoria cruzada entre coaches.',
    type: 'subscription',
  },
  sesion_personal_1: {
    title: 'Sesión con Coach Humana',
    description: 'Sesión 1:1 de 60 minutos con una coach profesional certificada.',
    type: 'session',
  },
  sesion_personal_4: {
    title: 'Pack 4 Sesiones - Coach Personal',
    description: '4 sesiones 1:1 de 60 minutos con coaches profesionales.',
    type: 'session',
  },
  sesion_personal_8: {
    title: 'Pack 8 Sesiones - Coach Personal',
    description: '8 sesiones 1:1 de 60 minutos con coaches profesionales.',
    type: 'session',
  },
  sesion_ejecutiva_1: {
    title: 'Sesión Ejecutiva',
    description: 'Sesión 1:1 de 60 minutos con un coach ejecutivo certificado.',
    type: 'session',
  },
  sesion_ejecutiva_4: {
    title: 'Pack 4 Sesiones Ejecutivas',
    description: '4 sesiones 1:1 de coaching ejecutivo profesional.',
    type: 'session',
  },
  sesion_ejecutiva_8: {
    title: 'Pack 8 Sesiones Ejecutivas',
    description: '8 sesiones 1:1 de coaching ejecutivo profesional.',
    type: 'session',
  },
}

function getMercadoPagoConfig(paisCodigo) {
  const isProduction = process.env.VERCEL_ENV === 'production'
  const configs = {
    CL: {
      accessToken: isProduction
        ? (process.env.MERCADOPAGO_ACCESS_TOKEN_CL || process.env.MERCADOPAGO_ACCESS_TOKEN)
        : (process.env.MERCADOPAGO_TEST_TOKEN_CL || process.env.MERCADOPAGO_ACCESS_TOKEN_CL || process.env.MERCADOPAGO_ACCESS_TOKEN),
      currency: 'CLP',
    },
    AR: {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN_AR,
      currency: 'ARS',
    },
    CO: {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN_CO,
      currency: 'COP',
    },
  }
  return configs[paisCodigo] || configs.CL
}

export async function POST(request) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { planId, userId, userEmail, vertical } = await request.json()

    const metadata = planesMetadata[planId]
    if (!metadata) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 400 })
    }

    // Obtener país del usuario desde su perfil
    let paisCodigo = PAIS_DEFAULT
    if (userId) {
      const { data: perfil } = await supabaseAdmin
        .from('perfiles')
        .select('pais_codigo')
        .eq('id', userId)
        .single()
      if (perfil?.pais_codigo && PAISES_SOPORTADOS.includes(perfil.pais_codigo)) {
        paisCodigo = perfil.pais_codigo
      }
    }

    // Obtener precio del plan para ese país desde la DB
    const { data: precioData } = await supabaseAdmin
      .from('precios_por_pais')
      .select('precio, moneda')
      .eq('pais_codigo', paisCodigo)
      .eq('plan_id', planId)
      .eq('activo', true)
      .single()

    if (!precioData) {
      return NextResponse.json({
        error: `Precio no disponible para ${planId} en ${paisCodigo}`
      }, { status: 400 })
    }

    // Config de Mercado Pago según país
    const mpConfig = getMercadoPagoConfig(paisCodigo)

    if (!mpConfig.accessToken) {
      // Fallback a Chile si el país no tiene token configurado todavía
      const fallback = getMercadoPagoConfig('CL')
      if (!fallback.accessToken) {
        return NextResponse.json({
          error: 'Payment not configured for this country yet'
        }, { status: 503 })
      }
      mpConfig.accessToken = fallback.accessToken
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coach-360-mujer.vercel.app'

    const verticalPath = vertical && ['general', 'lideres'].includes(vertical)
      ? `/${vertical}/dashboard`
      : '/dashboard'

    const preference = {
      items: [
        {
          title: metadata.title,
          description: metadata.description,
          quantity: 1,
          currency_id: precioData.moneda,
          unit_price: precioData.precio,
        },
      ],
      payer: { email: userEmail || '' },
      back_urls: {
        success: `${baseUrl}${verticalPath}?payment=success&plan=${planId}`,
        failure: `${baseUrl}${verticalPath}?payment=failure`,
        pending: `${baseUrl}${verticalPath}?payment=pending`,
      },
      auto_return: 'approved',
      external_reference: `${userId}_${planId}_${vertical || 'mujer'}_${paisCodigo}_${Date.now()}`,
      notification_url: `${baseUrl}/api/webhook`,
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpConfig.accessToken}`,
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
