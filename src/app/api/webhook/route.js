import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()

    if (body.type === 'payment' && body.data?.id) {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

      // Get payment details from MercadoPago
      const paymentRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${body.data.id}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      )

      const payment = await paymentRes.json()

      if (payment.status === 'approved' && payment.external_reference) {
        const parts = payment.external_reference.split('_')
        const userId = parts[0]
        const planId = parts[1]

        if (userId && planId && (planId === 'esencial' || planId === 'premium')) {
          // Update user plan in database
          await supabaseAdmin
            .from('perfiles')
            .update({
              plan_actual: planId,
              fecha_inicio_plan: new Date().toISOString(),
            })
            .eq('id', userId)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
