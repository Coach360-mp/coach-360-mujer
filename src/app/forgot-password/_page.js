'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { RealPortrait } from '@/components/design/icons'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (err) {
      setError('No encontramos esa dirección. Revisa el email.')
      setLoading(false)
      return
    }
    setEnviado(true)
    setLoading(false)
  }

  return (
    <div
      className="dir-ritual"
      data-v="clara"
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div className="eyebrow" style={{ marginBottom: 16, textAlign: 'center' }}>
          Recuperación de contraseña
        </div>

        <div
          style={{
            background: 'var(--ink-2)',
            border: '1px solid var(--line)',
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 18px',
              borderBottom: '1px solid var(--line)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-dim)',
              letterSpacing: '.08em',
            }}
          >
            /forgot-password
          </div>

          <div style={{ padding: '36px 28px 32px' }}>
            {!enviado ? (
              <form onSubmit={handleSubmit}>
                <RealPortrait src="/clara.jpg" size={48} />
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 7vw, 34px)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    fontWeight: 400,
                    marginTop: 22,
                    marginBottom: 10,
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </h1>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--text-muted)',
                    lineHeight: 1.55,
                    marginBottom: 22,
                    maxWidth: 340,
                  }}
                >
                  Escribe tu email y te enviamos un enlace para crear una nueva.
                  El enlace dura 60 minutos.
                </p>

                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-dim)',
                    letterSpacing: '.08em',
                    marginBottom: 6,
                  }}
                >
                  EMAIL
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--line-strong)',
                    background: 'var(--ink-3)',
                    color: 'var(--text)',
                    fontSize: 14,
                    marginBottom: 16,
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                {error && (
                  <p
                    style={{
                      color: '#f87171',
                      fontSize: 13,
                      marginBottom: 12,
                      lineHeight: 1.4,
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'var(--v-primary)',
                    color: '#0a0c0e',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: loading || !email.trim() ? 'default' : 'pointer',
                    opacity: loading || !email.trim() ? 0.5 : 1,
                    marginBottom: 12,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {loading ? 'Enviando…' : 'Enviar enlace'}
                </button>

                <Link
                  href="/login"
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: 'var(--text-dim)',
                    textAlign: 'center',
                    textDecoration: 'underline',
                  }}
                >
                  Volver a iniciar sesión
                </Link>
              </form>
            ) : (
              <div>
                <RealPortrait src="/clara.jpg" size={48} />
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(28px, 7vw, 34px)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    fontWeight: 400,
                    marginTop: 22,
                    marginBottom: 10,
                  }}
                >
                  Revisa tu email.
                </h1>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--text-muted)',
                    lineHeight: 1.55,
                    marginBottom: 22,
                  }}
                >
                  Te enviamos un enlace a{' '}
                  <span style={{ color: 'var(--v-primary)' }}>{email}</span>.
                  Tienes 60 minutos para usarlo.
                </p>
                <Link
                  href="/login"
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: 'var(--text-dim)',
                    textAlign: 'center',
                    textDecoration: 'underline',
                  }}
                >
                  Volver a iniciar sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
