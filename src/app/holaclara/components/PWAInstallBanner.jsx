'use client'
import { useState, useEffect } from 'react'
export default function PWAInstallBanner() {
  const [mostrar, setMostrar] = useState(false)
  const [esIOS, setEsIOS] = useState(false)
  const [prompt, setPrompt] = useState(null)
  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setEsIOS(ios)
    const yaInstalada = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    if (yaInstalada) return
    if (localStorage.getItem('pwa-cerrado')) return
    if (ios) { setTimeout(() => setMostrar(true), 4000) }
    else { window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setPrompt(e); setTimeout(() => setMostrar(true), 4000) }) }
  }, [])
  const instalar = async () => { if (prompt) { prompt.prompt(); await prompt.userChoice }; setMostrar(false) }
  const cerrar = () => { setMostrar(false); localStorage.setItem('pwa-cerrado', '1') }
  if (!mostrar) return null
  return (
    <div style={{ position:'fixed', bottom:'80px', left:'12px', right:'12px', background:'#2A2520', borderRadius:'16px', padding:'16px', zIndex:9999, boxShadow:'0 8px 32px rgba(0,0,0,0.3)', fontFamily:"'Inter Tight',sans-serif" }}>
      <div style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
        <img src="/icon-192.png" style={{ width:'44px', height:'44px', borderRadius:'10px', flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'#FAFAF7', marginBottom:'3px' }}>Agrega Clara a tu pantalla de inicio</div>
          {esIOS ? <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)', lineHeight:1.5 }}>Toca <strong style={{color:'#C9A96E'}}>Compartir</strong> y luego <strong style={{color:'#C9A96E'}}>"Agregar a inicio"</strong></div>
          : <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)', lineHeight:1.5 }}>Instala Clara como app para acceder sin abrir el navegador.</div>}
        </div>
        <button onClick={cerrar} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'20px', cursor:'pointer', padding:0, lineHeight:1 }}>x</button>
      </div>
      {!esIOS && prompt && <button onClick={instalar} style={{ width:'100%', marginTop:'12px', padding:'10px', background:'#C9A96E', color:'#2A2520', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Instalar Clara</button>}
    </div>
  )
}