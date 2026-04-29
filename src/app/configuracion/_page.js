'use client'

import Link from 'next/link'
import { Sigil } from '@/components/design/icons'
import CambiarCoach from '@/components/configuracion/CambiarCoach'

export default function ConfiguracionPage() {
  return (
    <div className="dir-ritual" data-v="leo" style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Sigil s={20} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Coach 360</span>
        <Link
          href="/dashboard?tab=coach360"
          style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', padding: '6px 12px', borderRadius: 999, border: '1px solid var(--line)' }}
        >
          ← Volver
        </Link>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 60px' }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Configuración</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 48px)', letterSpacing: '-0.03em', fontWeight: 400, lineHeight: 1, marginBottom: 32 }}>
          Tu cuenta.
        </h1>

        <section style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 18, padding: '28px 24px', marginBottom: 20 }}>
          <CambiarCoach />
        </section>

        <section style={{ background: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 18, padding: '28px 24px' }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>✦ Otros</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/planes" style={{ fontSize: 14, color: 'var(--text)', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              Cambiar plan →
            </Link>
            <Link href="/forgot-password" style={{ fontSize: 14, color: 'var(--text)', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              Cambiar contraseña →
            </Link>
            <Link href="/privacidad" style={{ fontSize: 14, color: 'var(--text-dim)', textDecoration: 'none', padding: '10px 0' }}>
              Política de privacidad
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
