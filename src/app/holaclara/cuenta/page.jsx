'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import TabBar from '../components/TabBar'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const PLAN_NOMBRES = { free: 'Gratis', esencial: 'Esencial', profundo: 'Profundo' }
const PLAN_COLORES = { free: '#9A8F84', esencial: '#C9A96E', profundo: '#534AB7' }

function formatFecha(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function CuentaPage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState(null)
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => { inicializar() }, [])

  async function inicializar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/holaclara/auth'); return }
    setEmail(user.email)

    const { data: p } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
    if (p) {
      setPerfil(p)
      setNombre(p.nombre || '')
    }
    setCargando(false)
  }

  async function guardarNombre() {
    if (!perfil || !nombre.trim()) return
    setGuardando(true)
    await supabase.from('perfiles').update({ nombre: nombre.trim() }).eq('id', perfil.id)
    setPerfil(prev => ({ ...prev, nombre: nombre.trim() }))
    setGuardando(false)
    setGuardado(true)
    setEditando(false)
    setTimeout(() => setGuardado(false), 2000)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/holaclara')
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF7', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#C9A96E' }}>
      cargando...
    </div>
  )

  const planActual = perfil?.plan_actual || 'free'
  const planColor = PLAN_COLORES[planActual] || '#9A8F84'
  const planNombre = PLAN_NOMBRES[planActual] || planActual
  const fechaFin = formatFecha(perfil?.fecha_fin_plan)
  const fechaInicio = formatFecha(perfil?.fecha_inicio_plan)

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' }}>
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>

          {/* NAV */}
          <nav style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(42,37,32,0.08)' }}>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', lineHeight: 1 }}>Clara</div>
              <div style={{ height: '1px', background: '#C9A96E', margin: '2px 0' }} />
            </div>
            <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700 }}>Mi cuenta</div>
            <button onClick={() => router.back()} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(42,37,32,0.2)', background: 'transparent', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: '#2A2520' }}>
              ← volver
            </button>
          </nav>

          <div style={{ padding: '24px 20px 100px' }}>

            {/* AVATAR + NOMBRE */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#F5EFE6', border: '2px solid #C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', color: '#C9A96E' }}>
                {(nombre || email || '?')[0].toUpperCase()}
              </div>
              {!editando ? (
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '22px', color: '#2A2520', marginBottom: '4px' }}>
                    {nombre || 'Sin nombre'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9A8F84', marginBottom: '8px' }}>{email}</div>
                  <button onClick={() => setEditando(true)} style={{ background: 'transparent', border: 'none', fontSize: '12px', color: '#C9A96E', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
                    Editar nombre
                  </button>
                </div>
              ) : (
                <div style={{ maxWidth: '280px', margin: '0 auto' }}>
                  <input value={nombre} onChange={e => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #C9A96E', background: '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: '#2A2520', outline: 'none', boxSizing: 'border-box', marginBottom: '8px', textAlign: 'center' }} />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={guardarNombre} style={{ padding: '8px 20px', borderRadius: '10px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                      {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button onClick={() => { setEditando(false); setNombre(perfil?.nombre || '') }} style={{ padding: '8px 16px', borderRadius: '10px', background: 'transparent', color: '#9A8F84', fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', border: '0.5px solid rgba(42,37,32,0.15)', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PLAN ACTUAL */}
            <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', marginBottom: '12px', border: '0.5px solid rgba(42,37,32,0.1)', borderLeft: `3px solid ${planColor}` }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '12px' }}>Tu plan</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '22px', color: '#2A2520' }}>{planNombre}</div>
                <div style={{ background: planColor, color: '#fff', fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                  {planActual === 'free' ? 'Gratis' : 'Activo'}
                </div>
              </div>

              {planActual !== 'free' && fechaInicio && (
                <div style={{ fontSize: '12px', color: '#9A8F84', marginBottom: '4px' }}>
                  Activo desde: <span style={{ color: '#2A2520', fontWeight: 700 }}>{fechaInicio}</span>
                </div>
              )}
              {planActual !== 'free' && fechaFin && (
                <div style={{ fontSize: '12px', color: '#9A8F84', marginBottom: '16px' }}>
                  Acceso hasta: <span style={{ color: '#2A2520', fontWeight: 700 }}>{fechaFin}</span>
                </div>
              )}

              {planActual === 'free' ? (
                <button onClick={() => router.push('/holaclara/planes')}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  Ver planes →
                </button>
              ) : (
                <div>
                  <button onClick={() => router.push('/holaclara/planes')}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'transparent', color: '#2A2520', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: '1px solid rgba(42,37,32,0.2)', cursor: 'pointer', marginBottom: '8px' }}>
                    Renovar plan
                  </button>
                  <div style={{ textAlign: 'center', fontSize: '11px', color: '#9A8F84', lineHeight: 1.6 }}>
                    ¿Quieres cancelar o tienes dudas?{' '}
                    <a href="mailto:hola@holaclara.app" style={{ color: '#C9A96E', textDecoration: 'none', fontWeight: 700 }}>
                      Escríbenos
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* GARANTÍA */}
            {planActual !== 'free' && (
              <div style={{ background: '#F5EFE6', borderRadius: '14px', padding: '14px 16px', marginBottom: '12px', borderLeft: '3px solid #C9A96E' }}>
                <div style={{ fontSize: '12px', color: '#2A2520', lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 700, color: '#C9A96E' }}>7 días para saber si es para ti.</span> Si no cambia nada, te devolvemos todo sin preguntas. Escríbenos a{' '}
                  <a href="mailto:hola@holaclara.app" style={{ color: '#C9A96E', textDecoration: 'none' }}>hola@holaclara.app</a>
                </div>
              </div>
            )}

            {/* CERRAR SESIÓN */}
            <button onClick={cerrarSesion}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', background: 'transparent', color: '#9A8F84', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', border: '0.5px solid rgba(42,37,32,0.15)', cursor: 'pointer', marginTop: '8px' }}>
              Cerrar sesión
            </button>

          </div>
        </div>
        <TabBar />
      </div>
    </>
  )
}
