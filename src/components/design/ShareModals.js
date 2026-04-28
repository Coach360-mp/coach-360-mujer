'use client'
// Modales de compartir post-test y descargar certificado (Fase 5 fase5b.jsx)
// - TestShareModal: preview de TestShareCard + native share + copiar
// - CertificateModal: preview de CertificateSheet + descargar PDF (window.print)

import { useState } from 'react'

const SITE_URL = 'https://www.micoach360.com'

const VERTICAL_DEFAULTS = {
  mujer:   { v: 'clara', coachImg: '/clara.jpg', coachName: 'Clara' },
  general: { v: 'leo',   coachImg: '/leo.jpg',   coachName: 'Leo'   },
  lideres: { v: 'marco', coachImg: '/marco.jpg', coachName: 'Marco' },
}

function vDefaults(vertical) {
  return VERTICAL_DEFAULTS[vertical] || VERTICAL_DEFAULTS.mujer
}

// ─────────────────────────────────────────────────────────────
// TestShareCardVisual — visual replica de fase5b L169-218
// ─────────────────────────────────────────────────────────────
function TestShareCardVisual({ perfil, descripcion, tags = [], coachImg, coachName, format = '1:1' }) {
  const W = format === '9:16' ? 320 : 360
  const H = format === '9:16' ? 568 : 360
  const titleSize = format === '9:16' ? 36 : 40
  return (
    <div style={{
      width: W, height: H, background: 'var(--bg)', color: 'var(--text)',
      position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      padding: format === '9:16' ? '28px 22px' : '28px 24px',
      borderRadius: 14, border: '1px solid var(--line)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 20%, color-mix(in oklab, var(--v-primary) 22%, transparent), transparent 60%), radial-gradient(ellipse at 80% 90%, color-mix(in oklab, var(--v-primary) 12%, transparent), transparent 55%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--v-primary)' }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.2em', color: 'var(--v-primary)' }}>COACH 360 · TEST</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.3em', color: 'var(--text-dim)', marginBottom: 12 }}>MI PERFIL ES</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: titleSize, letterSpacing: '-0.04em', fontWeight: 400, lineHeight: .98, margin: 0, marginBottom: 16, fontStyle: 'italic', color: 'var(--v-primary)' }}>
          {perfil}
        </h2>
        {descripcion && (
          <p style={{ fontFamily: 'var(--font-display)', fontSize: format === '9:16' ? 14 : 13, lineHeight: 1.45, fontStyle: 'italic', color: 'var(--text-muted)', margin: 0, marginBottom: 16 }}>
            {descripcion.length > 140 ? descripcion.slice(0, 137) + '…' : descripcion}
          </p>
        )}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.slice(0, 3).map(t => (
              <span key={t} style={{ padding: '4px 10px', borderRadius: 999, background: 'color-mix(in oklab, var(--v-primary) 20%, transparent)', border: '1px solid color-mix(in oklab, var(--v-primary) 40%, transparent)', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--v-primary)', letterSpacing: '.08em' }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={coachImg} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontStyle: 'italic' }}>{coachName}</div>
            <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', letterSpacing: '.1em' }}>MI COACH</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '.15em' }}>HAZ EL TEST</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--v-primary)', letterSpacing: '.1em' }}>MICOACH360.COM</div>
        </div>
      </div>
    </div>
  )
}

export function TestShareModal({ open, onClose, perfil, descripcion, tags = [], vertical = 'mujer' }) {
  const [format, setFormat] = useState('1:1')
  const [feedback, setFeedback] = useState('')
  if (!open) return null
  const { v, coachImg, coachName } = vDefaults(vertical)

  const shareText = `Mi perfil en Coach 360: "${perfil}".${descripcion ? ` ${descripcion}` : ''}\n\nHaz tu test en ${SITE_URL}`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mi perfil Coach 360', text: shareText, url: SITE_URL })
        setFeedback('')
      } catch (e) {
        // Usuario canceló — silencioso
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        setFeedback('Copiado al portapapeles')
        setTimeout(() => setFeedback(''), 2400)
      } catch {
        setFeedback('No se pudo copiar')
      }
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setFeedback('Copiado al portapapeles')
      setTimeout(() => setFeedback(''), 2400)
    } catch {
      setFeedback('No se pudo copiar')
    }
  }

  return (
    <div className="dir-ritual" data-v={v} onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 3000, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,12,14,.78)', padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto',
        background: 'var(--ink-2)', border: '1px solid var(--line-strong)',
        borderRadius: 20, color: 'var(--text)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <div className="eyebrow">✦ Compartir tu perfil</div>
          <button onClick={onClose} aria-label="Cerrar" style={{ width: 28, height: 28, borderRadius: 14, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { k: '1:1',  l: 'Post 1:1' },
              { k: '9:16', l: 'Story 9:16' },
            ].map(f => (
              <button key={f.k} onClick={() => setFormat(f.k)} style={{
                padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                background: format === f.k ? 'var(--v-primary)' : 'var(--ink-3)',
                color: format === f.k ? '#0a0c0e' : 'var(--text-muted)',
                border: '1px solid var(--line-strong)',
                fontSize: 12, fontWeight: format === f.k ? 600 : 400,
                fontFamily: 'var(--font-sans)',
              }}>{f.l}</button>
            ))}
          </div>

          <div style={{ padding: '14px 14px 18px', background: 'var(--ink-3)', border: '1px solid var(--line)', borderRadius: 14 }}>
            <TestShareCardVisual
              perfil={perfil}
              descripcion={descripcion}
              tags={tags}
              coachImg={coachImg}
              coachName={coachName}
              format={format}
            />
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={handleShare} style={{
              width: '100%', padding: 13, borderRadius: 12, border: 'none',
              background: 'var(--v-primary)', color: '#0a0c0e',
              fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-sans)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              Compartir
            </button>
            <button onClick={handleCopy} style={{
              width: '100%', padding: 12, borderRadius: 12,
              border: '1px solid var(--line-strong)', background: 'transparent',
              color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}>
              Copiar texto
            </button>
            {feedback && (
              <div style={{ fontSize: 12, color: 'var(--v-primary)', textAlign: 'center', fontFamily: 'var(--font-mono)', letterSpacing: '.05em' }}>
                {feedback}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CertificateSheetVisual — replica de fase5b L6-77 (1:1)
// ─────────────────────────────────────────────────────────────
function CertificateSheetVisual({ userName, moduloTitulo, fechaCompletado, coachName, coachTag, certNum, scale = 1 }) {
  const fecha = fechaCompletado
    ? new Date(fechaCompletado).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div style={{
      width: 540, height: 540, background: '#f6f1e8', color: '#1a1612',
      position: 'relative', display: 'flex', flexDirection: 'column',
      padding: '40px 36px', fontFamily: 'var(--font-display)', overflow: 'hidden',
      transform: `scale(${scale})`, transformOrigin: 'top left',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.6), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(0,0,0,.04), transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 18, border: '1px solid rgba(26,22,18,.14)', borderRadius: 4, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, position: 'relative' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.2em', color: 'rgba(26,22,18,.55)' }}>✦ COACH 360 · {(coachName || '').toUpperCase()}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '.15em', color: 'rgba(26,22,18,.45)' }}>N.º {certNum}</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.3em', color: 'rgba(26,22,18,.5)', marginBottom: 18 }}>SE OTORGA ESTE RECONOCIMIENTO A</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 300, letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: 24, fontStyle: 'italic' }}>
          {userName}
        </div>
        <div style={{ width: 60, height: 1, background: 'rgba(26,22,18,.4)', marginBottom: 22 }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.3em', color: 'rgba(26,22,18,.5)', marginBottom: 14 }}>POR COMPLETAR EL MÓDULO</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 14, maxWidth: 420 }}>
          {moduloTitulo}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 18, alignItems: 'end', position: 'relative', paddingTop: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontStyle: 'italic', lineHeight: 1, marginBottom: 4 }}>{coachName}</div>
          <div style={{ height: 1, background: 'rgba(26,22,18,.3)', marginBottom: 4, maxWidth: 130 }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '.2em', color: 'rgba(26,22,18,.5)' }}>COACH · {(coachTag || '').toUpperCase()}</div>
        </div>
        <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px dashed rgba(26,22,18,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', border: '1px solid rgba(26,22,18,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 13, fontStyle: 'italic', color: 'rgba(26,22,18,.9)' }}>
            C·360
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontStyle: 'italic', lineHeight: 1, marginBottom: 4 }}>{fecha}</div>
          <div style={{ height: 1, background: 'rgba(26,22,18,.3)', marginBottom: 4, marginLeft: 'auto', maxWidth: 130 }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '.2em', color: 'rgba(26,22,18,.5)' }}>COACH 360 · MI</div>
        </div>
      </div>
    </div>
  )
}

export function CertificateModal({
  open, onClose, userName, moduloTitulo, fechaCompletado,
  vertical = 'mujer', coachTag = 'Coach certificada', certNum,
}) {
  if (!open) return null
  const { v, coachName } = vDefaults(vertical)
  const num = certNum || (() => {
    const y = new Date().getFullYear()
    const r = Math.floor(Math.random() * 9000 + 1000)
    return `${r}-${y}`
  })()

  const handleDownload = () => {
    const fecha = fechaCompletado
      ? new Date(fechaCompletado).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"/>
<title>Certificado · ${moduloTitulo}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #f6f1e8; font-family: 'Cormorant Garamond', Georgia, serif; }
  .sheet { width: 210mm; height: 297mm; padding: 30mm 28mm; position: relative; display: flex; flex-direction: column; color: #1a1612; }
  .frame { position: absolute; inset: 14mm; border: 1px solid rgba(26,22,18,.14); border-radius: 4px; }
  .head { display: flex; justify-content: space-between; margin-bottom: 18mm; position: relative; }
  .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
  .h1 { font-size: 11pt; letter-spacing: .2em; color: rgba(26,22,18,.55); }
  .h2 { font-size: 9pt; letter-spacing: .15em; color: rgba(26,22,18,.45); }
  .body { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; position: relative; }
  .lab { font-size: 10pt; letter-spacing: .3em; color: rgba(26,22,18,.5); margin-bottom: 8mm; }
  .name { font-size: 56pt; font-weight: 300; letter-spacing: -0.025em; line-height: 1.05; margin-bottom: 10mm; font-style: italic; }
  .div { width: 24mm; height: 1px; background: rgba(26,22,18,.4); margin-bottom: 8mm; }
  .modn { font-size: 32pt; font-weight: 400; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 10mm; max-width: 140mm; }
  .foot { display: grid; grid-template-columns: 1fr auto 1fr; gap: 10mm; align-items: end; position: relative; padding-top: 6mm; }
  .col-r { text-align: right; }
  .signed { font-size: 18pt; font-style: italic; line-height: 1; margin-bottom: 2mm; }
  .line { height: 1px; background: rgba(26,22,18,.3); margin-bottom: 2mm; max-width: 60mm; }
  .col-r .line { margin-left: auto; }
  .role { font-size: 9pt; letter-spacing: .2em; color: rgba(26,22,18,.5); }
  .seal { width: 22mm; height: 22mm; border-radius: 50%; border: 1px dashed rgba(26,22,18,.35); display: flex; align-items: center; justify-content: center; }
  .seal > div { width: 16mm; height: 16mm; border-radius: 50%; border: 1px solid rgba(26,22,18,.35); display: flex; align-items: center; justify-content: center; font-style: italic; font-size: 12pt; color: rgba(26,22,18,.9); }
</style></head>
<body>
  <div class="sheet">
    <div class="frame"></div>
    <div class="head">
      <div class="mono h1">✦ COACH 360 · ${(coachName || '').toUpperCase()}</div>
      <div class="mono h2">N.º ${num}</div>
    </div>
    <div class="body">
      <div class="mono lab">SE OTORGA ESTE RECONOCIMIENTO A</div>
      <div class="name">${userName}</div>
      <div class="div"></div>
      <div class="mono lab" style="margin-bottom:6mm">POR COMPLETAR EL MÓDULO</div>
      <div class="modn">${moduloTitulo}</div>
    </div>
    <div class="foot">
      <div>
        <div class="signed">${coachName}</div>
        <div class="line"></div>
        <div class="mono role">COACH · ${(coachTag || '').toUpperCase()}</div>
      </div>
      <div class="seal"><div>C·360</div></div>
      <div class="col-r">
        <div class="signed">${fecha}</div>
        <div class="line"></div>
        <div class="mono role">COACH 360 · MI</div>
      </div>
    </div>
  </div>
  <script>window.onload = () => { setTimeout(() => window.print(), 200); };</script>
</body></html>`
    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  return (
    <div className="dir-ritual" data-v={v} onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 3000, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,12,14,.78)', padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 580, maxHeight: '92vh', overflowY: 'auto',
        background: 'var(--ink-2)', border: '1px solid var(--line-strong)',
        borderRadius: 20, color: 'var(--text)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <div className="eyebrow">✦ Tu certificado</div>
          <button onClick={onClose} aria-label="Cerrar" style={{ width: 28, height: 28, borderRadius: 14, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, margin: 0, textAlign: 'center', maxWidth: 420 }}>
            Completaste <em style={{ color: 'var(--v-primary)', fontStyle: 'italic' }}>{moduloTitulo}</em>. Descárgalo en PDF y guárdalo donde quieras.
          </p>

          <div style={{
            width: 'min(100%, 380px)', height: 380,
            background: 'var(--ink-3)', border: '1px solid var(--line)',
            borderRadius: 14, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ transform: 'scale(0.66)', transformOrigin: 'center', width: 540, height: 540 }}>
              <CertificateSheetVisual
                userName={userName}
                moduloTitulo={moduloTitulo}
                fechaCompletado={fechaCompletado}
                coachName={coachName}
                coachTag={coachTag}
                certNum={num}
              />
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={handleDownload} style={{
              width: '100%', padding: 13, borderRadius: 12, border: 'none',
              background: 'var(--v-primary)', color: '#0a0c0e',
              fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-sans)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Descargar PDF
            </button>
            <button onClick={onClose} style={{
              width: '100%', padding: 12, borderRadius: 12,
              border: '1px solid var(--line-strong)', background: 'transparent',
              color: 'var(--text)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
