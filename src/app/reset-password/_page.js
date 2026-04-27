'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function evaluarFuerza(pw) {
  if (!pw) return { score: 0, label: '—' }
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const score = Math.min(4, s)
  const label = score <= 1 ? 'débil' : score === 2 ? 'regular' : score === 3 ? 'buena' : 'fuerte'
  return { score, label }
}

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') return
    })
    return () => subscription.unsubscribe()
  }, [])

  const fuerza = useMemo(() => evaluarFuerza(password), [password])

  const handleReset = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError('Hubo un error. El enlace puede haber expirado.')
      setLoading(false)
      return
    }
    setListo(true)
    setTimeout(() => router.push('/login'), 2500)
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
            /reset-password
          </div>

          <div style={{ padding: '36px 28px 32px' }}>
            {!listo ? (
              <form onSubmit={handleReset}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--v-tint)',
                    color: 'var(--v-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>

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
                  Una nueva contraseña.
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
                  Te pedimos 8 caracteres mínimo. Lo demás, tú.
                </p>

                <label
                  htmlFor="pw-nueva"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-dim)',
                    letterSpacing: '.08em',
                    marginBottom: 6,
                  }}
                >
                  NUEVA
                </label>
                <input
                  id="pw-nueva"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--line-strong)',
                    background: 'var(--ink-3)',
                    color: 'var(--text)',
                    fontSize: 14,
                    marginBottom: 14,
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        background: 'var(--v-primary)',
                        opacity: i < fuerza.score ? 1 : 0.18,
                        borderRadius: 2,
                        transition: 'opacity 200ms',
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginBottom: 18,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    Fuerza:{' '}
                    <em
                      style={{
                        color: fuerza.score >= 3 ? 'var(--success)' : 'var(--text-muted)',
                        fontStyle: 'normal',
                      }}
                    >
                      {fuerza.label}
                    </em>
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                    {password.length} · {password.length >= 8 ? 'OK' : 'CORTA'}
                  </span>
                </div>

                <label
                  htmlFor="pw-rep"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-dim)',
                    letterSpacing: '.08em',
                    marginBottom: 6,
                  }}
                >
                  REPETIR
                </label>
                <input
                  id="pw-rep"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--line-strong)',
                    background: 'var(--ink-3)',
                    color: 'var(--text)',
                    fontSize: 14,
                    marginBottom: 16,
                    fontFamily: 'var(--font-mono)',
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
                  disabled={loading || !password || !confirm}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'var(--v-primary)',
                    color: '#0a0c0e',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: loading || !password || !confirm ? 'default' : 'pointer',
                    opacity: loading || !password || !confirm ? 0.5 : 1,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {loading ? 'Guardando…' : 'Guardar y volver'}
                </button>
              </form>
            ) : (
              <div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--v-tint)',
                    color: 'var(--v-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </div>
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
                  Contraseña actualizada.
                </h1>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--text-muted)',
                    lineHeight: 1.55,
                  }}
                >
                  Todo listo. Te llevamos a iniciar sesión en un momento…
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
