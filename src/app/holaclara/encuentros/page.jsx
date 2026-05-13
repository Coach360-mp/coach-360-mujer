'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import TabBar from '../components/TabBar'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const CATEGORIAS = [
  { id: 'circulos', nombre: 'Circulos de mujeres', desc: 'Espacios seguros para hablar de lo que no se dice en otros lados', color: '#F5EFE6', acento: '#C9A96E' },
  { id: 'talleres', nombre: 'Talleres online', desc: 'Aprender juntas desde cualquier lugar de LATAM', color: '#EAF5EE', acento: '#1D9E75' },
  { id: 'lectura', nombre: 'Grupos de lectura', desc: 'Libros que mueven algo por dentro, con otras que los leen igual', color: '#EEEDFE', acento: '#534AB7' },
  { id: 'retiros', nombre: 'Retiros y experiencias', desc: 'Presencial, para cuando necesitas salir del ruido completamente', color: '#FAECE7', acento: '#993C1D' },
]

export default function EncuentrosPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [intereses, setIntereses] = useState([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/holaclara/auth'); return }
      supabase.from('perfiles').select('email').eq('id', user.id).single().then(({ data: p }) => {
        if (p?.email) setEmail(p.email)
      })
    })
  }, [])

  const toggle = (id) => setIntereses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const unirse = async () => {
    if (!email.trim()) return
    setEnviando(true)
    try {
      await supabase.from('encuentros_lista_espera').upsert({ email: email.trim(), intereses }, { onConflict: 'email' })
      setEnviado(true)
    } catch(e) { console.error(e) }
    setEnviando(false)
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={{ minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' }}>
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          <nav style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(42,37,32,0.08)' }}>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', lineHeight: 1 }}>Clara</div>
              <div style={{ height: '1px', background: '#C9A96E', margin: '2px 0' }} />
            </div>
            <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700 }}>Encuentros</div>
            <button onClick={() => router.back()} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(42,37,32,0.2)', background: 'transparent', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: '#2A2520' }}>
              volver
            </button>
          </nav>

          <div style={{ padding: '32px 20px 100px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '8px' }}>Proximamente</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '30px', color: '#2A2520', marginBottom: '8px', lineHeight: 1.1 }}>
              Donde las mujeres se encuentran de verdad.
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: '17px', color: '#C9A96E', marginBottom: '20px' }}>online y presencial, en LATAM</div>
            <div style={{ fontSize: '14px', color: '#6B6057', lineHeight: 1.7, marginBottom: '32px' }}>
              El directorio curado de actividades por y para mujeres. Sin algoritmos, sin anuncios. Solo espacios reales donde conectar con otras que estan buscando lo mismo.
            </div>

            <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '12px' }}>Que te interesa?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
              {CATEGORIAS.map(cat => {
                const sel = intereses.includes(cat.id)
                return (
                  <div key={cat.id} onClick={() => toggle(cat.id)}
                    style={{ background: sel ? cat.color : '#fff', border: sel ? `2px solid ${cat.acento}` : '0.5px solid rgba(42,37,32,0.12)', borderRadius: '14px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#2A2520', marginBottom: '2px' }}>{cat.nombre}</div>
                      <div style={{ fontSize: '12px', color: '#6B6057', lineHeight: 1.4 }}>{cat.desc}</div>
                    </div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: sel ? 'none' : '1.5px solid rgba(42,37,32,0.2)', background: sel ? cat.acento : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {sel && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><polyline points="1,4 3.5,6.5 9,1.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    </div>
                  </div>
                )
              })}
            </div>

            {!enviado ? (
              <div style={{ background: '#2A2520', borderRadius: '20px', padding: '24px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: '12px' }}>Unete a la lista</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#FAFAF7', marginBottom: '16px', lineHeight: 1.3 }}>Se de las primeras en saber cuando abren los Encuentros.</div>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Tu email"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.1)', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', color: '#FAFAF7', outline: 'none', boxSizing: 'border-box', marginBottom: '10px' }} />
                <button onClick={unirse} disabled={!email.trim() || enviando}
                  style={{ width: '100%', padding: '13px', borderRadius: '10px', background: '#C9A96E', color: '#2A2520', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: email.trim() ? 'pointer' : 'default', opacity: email.trim() ? 1 : 0.5 }}>
                  {enviando ? 'Guardando...' : 'Avisarme cuando abra'}
                </button>
              </div>
            ) : (
              <div style={{ background: '#EAF5EE', borderRadius: '20px', padding: '24px', textAlign: 'center', border: '2px solid #1D9E75' }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '22px', color: '#2A2520', marginBottom: '8px' }}>Listo.</div>
                <div style={{ fontSize: '13px', color: '#6B6057', lineHeight: 1.6 }}>Te avisaremos cuando haya Encuentros disponibles.</div>
              </div>
            )}
          </div>
        </div>
        <TabBar />
      </div>
    </>
  )
}
