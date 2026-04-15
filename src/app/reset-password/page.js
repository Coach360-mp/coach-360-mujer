'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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

  const handleReset = async () => {
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError('Hubo un error. El link puede haber expirado.'); setLoading(false); return }
    setListo(true)
    setTimeout(() => router.push('/'), 3000)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a1410 0%, #0a0a0a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      <div style={{ fontSize: 32, color: '#d4af37', marginBottom: 24 }}>✦</div>
      <div style={{ fontSize: 11, letterSpacing: 4, color: '#d4af37', textTransform: 'uppercase', marginBottom: 32, fontWeight: 600 }}>Coach 360</div>
      {!listo ? (
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, marginBottom: 12 }}>Nueva contraseña</h1>
          <p style={{ fontSize: 14, color: '#a8a8a8', lineHeight: 1.6, marginBottom: 32 }}>Elige una contraseña segura para tu cuenta.</p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nueva contraseña" style={{ width: '100%', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 14, padding: '16px 20px', color: '#fff', fontSize: 16, fontFamily: 'inherit', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repetir contraseña" onKeyDown={e => e.key === 'Enter' && handleReset()} style={{ width: '100%', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 14, padding: '16px 20px', color: '#fff', fontSize: 16, fontFamily: 'inherit', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />
          {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</p>}
          <button onClick={handleReset} disabled={loading || !password || !confirm} style={{ width: '100%', background: password && confirm ? 'linear-gradient(135deg, #d4af37, #f5c842)' : 'rgba(212,175,55,0.2)', color: password && confirm ? '#0a0a0a' : '#a8a8a8', border: 'none', padding: '16px 24px', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: password && confirm ? 'pointer' : 'default', fontFamily: 'inherit' }}>
            {loading ? 'Guardando...' : 'Guardar contraseña ✦'}
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>✦</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 300, marginBottom: 16 }}>Contraseña actualizada</h2>
          <p style={{ fontSize: 15, color: '#c8c8c8', lineHeight: 1.6 }}>Todo listo. Te redirigimos en un momento...</p>
        </div>
      )}
    </div>
  )
}