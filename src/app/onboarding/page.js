'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const steps = [
  {
    title: 'Bienvenida a\nCoach 360 Mujer',
    subtitle: 'Más claridad. Más poder. Más tú.',
    desc: 'Un espacio diseñado para que te conozcas mejor, tomes mejores decisiones y vivas más alineada con lo que realmente quieres.',
    bg: 'linear-gradient(180deg, #1a1a1a 0%, #2d2218 100%)',
    dark: true,
  },
  {
    title: 'Tu equipo de coaches',
    subtitle: 'Tres coaches con IA, cada una con su especialidad',
    desc: 'Clara te escucha con empatía. Sofía te guía con estrategia. Victoria te desafía con neurociencia. Todas disponibles 24/7, con voz, listas para ti.',
    showCoaches: true,
  },
  {
    title: 'Tests de autoconocimiento',
    subtitle: 'Descubre cómo piensas, sientes y decides',
    desc: '6 tests basados en coaching profesional que te revelan patrones que no ves. Tus resultados guían tu camino dentro de la app.',
  },
  {
    title: 'Herramientas prácticas',
    subtitle: 'Ejercicios con neurociencia aplicada',
    desc: 'No es teoría — son herramientas que usas en tu día a día para regular tus emociones, tomar mejores decisiones y cuidar tu bienestar integral.',
  },
  {
    title: 'Tu Equilibrio',
    subtitle: 'Mente · Cuerpo · Corazón · Espíritu',
    desc: 'Haz seguimiento diario de las 4 dimensiones que impactan tu claridad. Con el tiempo, vas a ver patrones que tu mente sola no detecta.',
    showDimensions: true,
  },
  {
    title: '¿Cómo te llamas?',
    subtitle: 'Para que tu coach te conozca',
    input: true,
  },
]

const coaches = [
  { name: 'Clara', photo: '/clara.jpg', credential: 'Coach certificada' },
  { name: 'Sofía', photo: '/sofia.jpg', credential: 'Especialista en autodesarrollo' },
  { name: 'Victoria', photo: '/victoria.jpg', credential: 'Neurobiología + Mentora' },
]

const dims = [
  { label: 'Mente', color: '#6366f1' },
  { label: 'Cuerpo', color: '#10b981' },
  { label: 'Corazón', color: '#f59e0b' },
  { label: 'Espíritu', color: '#8b5cf6' },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [nombre, setNombre] = useState('')
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setUser(user)

    // If already onboarded, go to dashboard
    const { data: profile } = await supabase.from('perfiles').select('onboarding_completado').eq('id', user.id).single()
    if (profile?.onboarding_completado) {
      router.push('/dashboard')
    }

    // Pre-fill name from Google
    if (user.user_metadata?.full_name) {
      setNombre(user.user_metadata.full_name)
    }
  }

  const completeOnboarding = async () => {
    if (user) {
      await supabase.from('perfiles').update({
        nombre: nombre || user.user_metadata?.full_name || '',
        onboarding_completado: true,
      }).eq('id', user.id)
    }
    router.push('/dashboard')
  }

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div style={{
      minHeight: '100vh',
      background: current.bg || 'var(--warm)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      color: current.dark ? '#fff' : 'var(--text)',
      textAlign: 'center',
      transition: 'background 0.5s ease',
    }}>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8, borderRadius: 4,
            background: i === step ? 'var(--gold)' : (current.dark ? 'rgba(255,255,255,0.3)' : '#e0dbd4'),
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* Star */}
      {step === 0 && <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>}

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: step === 0 ? 36 : 28,
        fontWeight: 600,
        lineHeight: 1.2,
        marginBottom: 8,
        whiteSpace: 'pre-line',
        color: current.dark ? '#fff' : 'var(--text)',
      }}>
        {current.title}
      </h1>

      {/* Subtitle */}
      {current.subtitle && (
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          color: current.dark ? 'var(--gold-light)' : 'var(--gold)',
          fontStyle: 'italic',
          marginBottom: 20,
        }}>
          {current.subtitle}
        </p>
      )}

      {/* Description */}
      {current.desc && (
        <p style={{
          fontSize: 15,
          color: current.dark ? 'rgba(255,255,255,0.7)' : 'var(--text-light)',
          maxWidth: 320,
          lineHeight: 1.6,
          marginBottom: 32,
        }}>
          {current.desc}
        </p>
      )}

      {/* Coaches display */}
      {current.showCoaches && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, justifyContent: 'center' }}>
          {coaches.map(c => (
            <div key={c.name} style={{ textAlign: 'center' }}>
              <img src={c.photo} alt={c.name} style={{
                width: 72, height: 72, borderRadius: '50%', objectFit: 'cover',
                border: '2px solid var(--gold-light)',
              }} />
              <p style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>{c.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-light)' }}>{c.credential}</p>
            </div>
          ))}
        </div>
      )}

      {/* Dimensions display */}
      {current.showDimensions && (
        <div style={{ display: 'flex', gap: 20, marginBottom: 32, justifyContent: 'center' }}>
          {dims.map(d => (
            <div key={d.label} style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: d.color, opacity: 0.8, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff' }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{d.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Name input */}
      {current.input && (
        <div style={{ width: '100%', maxWidth: 320, marginBottom: 32 }}>
          <input
            className="input-field"
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ textAlign: 'center', fontSize: 18 }}
          />
        </div>
      )}

      {/* Buttons */}
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLast ? (
          <button
            className="btn-primary"
            style={{ background: 'var(--gold)' }}
            onClick={completeOnboarding}
            disabled={!nombre.trim()}
          >
            Comenzar mi viaje ✦
          </button>
        ) : (
          <button
            className="btn-primary"
            style={current.dark ? { background: 'var(--gold)', color: '#fff' } : {}}
            onClick={() => setStep(step + 1)}
          >
            Siguiente
          </button>
        )}

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              background: 'none', border: 'none',
              color: current.dark ? 'rgba(255,255,255,0.5)' : 'var(--text-light)',
              fontSize: 14, cursor: 'pointer',
            }}
          >
            ← Anterior
          </button>
        )}
      </div>
    </div>
  )
}
