'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError('No encontramos esa dirección. Revisa el email.'); setLoading(false); return }
    setEnviado(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a1410 0%, #0a0a0a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      <div style={{ fontSize: 32, color: '#d4af37', marginBottom: 24 }}>✦</div>
      <div style={{ fontSize: 11, letterSpacing: 4, color: '#d4af37', textTransform: 'uppercase', marginBottom: 32, fontWeight: 600 }}>Coach 360</div>
      {!enviado ? (
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, marginBottom: 12 }}>Recupera tu acceso</h1>
          <p style={{ fontSize: 14, color: '#a8a8a8', lineHeight: 1.6, marginBottom: 32 }}>Ingresa tu email y te enviamos un link para crear una nueva contraseña.</p>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ width: '100%', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 14, padding: '16px 20px', color: '#fff', fontSize: 16, fontFamily: 'inherit', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />
          {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</p>}
          <button onClick={handleSubmit} disabled={loading || !email.trim()} style={{ width: '100%', background: email.trim() ? 'linear-gradient(135deg, #d4af37, #f5c842)' : 'rgba(212,175,55,0.2)', color: email.trim() ? '#0a0a0a' : '#a8a8a8', border: 'none', padding: '16px 24px', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: email.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
            {loading ? 'Enviando...' : 'Enviar link ✦'}
          </button>
          <a href="/" style={{ display: 'block', marginTop: 20, fontSize: 13, color: '#a8a8a8', textDecoration: 'none' }}>← Volver al inicio</a>
        </div>
      ) : (
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>✦</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 300, marginBottom: 16 }}>Revisa tu email</h2>
          <p style={{ fontSize: 15, color: '#c8c8c8', lineHeight: 1.6, marginBottom: 32 }}>Te enviamos un link a <strong style={{ color: '#d4af37' }}>{email}</strong>. Tienes 60 minutos para usarlo.</p>
          <a href="/" style={{ fontSize: 13, color: '#a8a8a8', textDecoration: 'none' }}>← Volver al inicio</a>
        </div>
      )}
    </div>
  )
}