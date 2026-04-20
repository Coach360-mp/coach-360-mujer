export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/clients'

const PAISES_SOPORTADOS = ['CL', 'AR', 'CO']
const PAIS_DEFAULT = 'CL'

async function detectarPaisPorIP(request) {
  try {
    const vercelCountry = request.headers.get('x-vercel-ip-country')
    if (vercelCountry && PAISES_SOPORTADOS.includes(vercelCountry)) {
      console.log('[pricing] País detectado por header Vercel:', vercelCountry)
      return vercelCountry
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || null

    if (ip && ip !== '::1' && ip !== '127.0.0.1') {
      try {
        const res = await fetch(`https://ipapi.co/${ip}/country/`, {
          headers: { 'User-Agent': 'Coach360/1.0' }
        })
        if (res.ok) {
          const country = (await res.text()).trim()
          if (PAISES_SOPORTADOS.includes(country)) {
            console.log('[pricing] País detectado por ipapi:', country)
            return country
          }
        }
      } catch (err) {
        console.error('[pricing] Error llamando ipapi:', err)
      }
    }

    console.log('[pricing] Usando país default:', PAIS_DEFAULT)
    return PAIS_DEFAULT
  } catch (err) {
    console.error('[pricing] Error detectando país:', err)
    return PAIS_DEFAULT
  }
}

export async function GET(request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    console.log('[pricing] GET recibido, userId:', userId || '(sin userId)')

    let paisCodigo = null

    // 1. Si hay userId, usa el país guardado en su perfil
    if (userId) {
      const { data: perfil, error: perfilErr } = await supabaseAdmin
        .from('perfiles')
        .select('pais_codigo')
        .eq('id', userId)
        .single()

      if (perfilErr) {
        console.error('[pricing] Error leyendo perfil:', perfilErr.message)
      }

      if (perfil?.pais_codigo && PAISES_SOPORTADOS.includes(perfil.pais_codigo)) {
        paisCodigo = perfil.pais_codigo
        console.log('[pricing] País desde perfil:', paisCodigo)
      } else {
        console.log('[pricing] Perfil sin pais_codigo válido, detectando...')
      }
    }

    // 2. Si no hay país, detectar por IP
    if (!paisCodigo) {
      paisCodigo = await detectarPaisPorIP(request)

      // Si hay userId pero no tenía país, guardarlo ahora
      if (userId) {
        const { error: updateErr } = await supabaseAdmin
          .from('perfiles')
          .update({ pais_codigo: paisCodigo })
          .eq('id', userId)
        if (updateErr) {
          console.error('[pricing] Error guardando pais_codigo en perfil:', updateErr.message)
        }
      }
    }

    // 3. Cargar precios para ese país
    const { data: precios, error: preciosErr } = await supabaseAdmin
      .from('precios_por_pais')
      .select('*')
      .eq('pais_codigo', paisCodigo)
      .eq('activo', true)

    if (preciosErr) {
      console.error('[pricing] Error query precios_por_pais:', preciosErr.message)
      return NextResponse.json({ error: preciosErr.message }, { status: 500 })
    }

    console.log('[pricing] Filas precios recibidas:', precios?.length || 0, 'para', paisCodigo)

    // 4. Info del país
    const paisesInfo = {
      CL: { nombre: 'Chile', moneda: 'CLP', simbolo: '$', formato: 'es-CL' },
      AR: { nombre: 'Argentina', moneda: 'ARS', simbolo: '$', formato: 'es-AR' },
      CO: { nombre: 'Colombia', moneda: 'COP', simbolo: '$', formato: 'es-CO' },
    }

    const info = paisesInfo[paisCodigo] || paisesInfo.CL

    // 5. Transformar precios en un mapa por plan_id
    const preciosPorPlan = {}
    if (precios) {
      precios.forEach(p => {
        preciosPorPlan[p.plan_id] = {
          precio: p.precio,
          precio_formateado: new Intl.NumberFormat(info.formato, {
            style: 'currency',
            currency: info.moneda,
            maximumFractionDigits: 0,
          }).format(p.precio),
        }
      })
    }

    console.log('[pricing] Respondiendo OK con', Object.keys(preciosPorPlan).length, 'planes')

    return NextResponse.json({
      pais_codigo: paisCodigo,
      pais_nombre: info.nombre,
      moneda: info.moneda,
      simbolo: info.simbolo,
      precios: preciosPorPlan,
    })
  } catch (error) {
    console.error('[pricing] Error no manejado:', error)
    return NextResponse.json({ error: error?.message || 'Failed to get pricing' }, { status: 500 })
  }
}
