'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const PASOS = [
  {
    id: 'chat_input',
    tab: 'chat',
    ruta: '/holaclara/chat',
    posicion: 'bottom',
    highlight: { bottom: '80px', left: '20px', right: '80px', height: '52px', borderRadius: '12px' },
    titulo: 'Escríbele a Clara',
    desc: 'Aquí empieza todo. Clara recuerda cada cosa que le cuentes — no tienes que repetirte.',
    accion: 'Toca el campo para continuar',
    tipo: 'highlight',
  },
  {
    id: 'chat_mic',
    tab: 'chat',
    ruta: '/holaclara/chat',
    posicion: 'bottom',
    highlight: { bottom: '80px', right: '20px', width: '44px', height: '44px', borderRadius: '50%' },
    titulo: 'Habla con tu voz',
    desc: 'También puedes dictarle. Clara escucha en español latinoamericano.',
    accion: 'Toca el micrófono para continuar',
    tipo: 'highlight',
  },
  {
    id: 'ir_conocerme',
    tab: 'chat',
    ruta: '/holaclara/chat',
    posicion: 'bottom',
    highlight: { bottom: '8px', left: '25%', width: '25%', height: '56px', borderRadius: '12px' },
    titulo: 'Ahora explora Conocerme',
    desc: 'Toca la espiral de abajo para ver todos los recursos que Clara tiene para ti.',
    accion: 'Toca el tab "Conocerme" ↓',
    tipo: 'instruccion',
    nextTab: '/holaclara/conocerme',
  },
  {
    id: 'conocerme_rituales',
    tab: 'conocerme',
    ruta: '/holaclara/conocerme',
    posicion: 'top',
    highlight: { top: '200px', left: '20px', right: '20px', height: '100px', borderRadius: '18px' },
    titulo: 'Rituales cortos',
    desc: 'Micro-pausas de 1 a 5 minutos. Sin excusas, sin tiempo mínimo. Para cuando lo necesitas.',
    accion: 'Toca para continuar',
    tipo: 'highlight',
  },
  {
    id: 'conocerme_journaling',
    tab: 'conocerme',
    ruta: '/holaclara/conocerme',
    posicion: 'top',
    highlight: { top: '310px', left: '20px', right: '20px', height: '100px', borderRadius: '18px' },
    titulo: 'Journaling guiado',
    desc: 'Tu diario privado. Solo tú lo lees — a menos que quieras compartirlo con Clara.',
    accion: 'Toca para continuar',
    tipo: 'highlight',
  },
  {
    id: 'conocerme_tests',
    tab: 'conocerme',
    ruta: '/holaclara/conocerme',
    posicion: 'top',
    highlight: { top: '420px', left: '20px', right: '20px', height: '100px', borderRadius: '18px' },
    titulo: 'Tests de autoconocimiento',
    desc: 'Descubre patrones que llevas años repitiendo. Cada test te da claridad concreta sobre ti misma.',
    accion: 'Toca para continuar',
    tipo: 'highlight',
  },
  {
    id: 'ir_yo',
    tab: 'conocerme',
    ruta: '/holaclara/conocerme',
    posicion: 'bottom',
    highlight: { bottom: '8px', left: '50%', width: '25%', height: '56px', borderRadius: '12px' },
    titulo: 'Ahora ve a tu espacio "Yo"',
    desc: 'Toca el ícono de persona abajo para ver tu progreso personal.',
    accion: 'Toca el tab "Yo" ↓',
    tipo: 'instruccion',
    nextTab: '/holaclara/yo',
  },
  {
    id: 'yo_nivel',
    tab: 'yo',
    ruta: '/holaclara/yo',
    posicion: 'top',
    highlight: { top: '260px', left: '20px', right: '20px', height: '200px', borderRadius: '20px' },
    titulo: 'Tu nivel de progreso',
    desc: 'Cada ritual, journaling y conversación con Clara suma puntos. Así subes de nivel y desbloqueas más herramientas.',
    accion: 'Toca para continuar',
    tipo: 'highlight',
  },
  {
    id: 'yo_historial',
    tab: 'yo',
    ruta: '/holaclara/yo',
    posicion: 'top',
    highlight: { top: '480px', left: '20px', right: '20px', height: '160px', borderRadius: '18px' },
    titulo: 'Tu historial de actividad',
    desc: 'Todo lo que haces queda registrado aquí — como los movimientos de tu cuenta bancaria, pero de tu crecimiento.',
    accion: 'Toca para continuar',
    tipo: 'highlight',
  },
  {
    id: 'cierre',
    tab: 'yo',
    ruta: '/holaclara/yo',
    posicion: 'center',
    highlight: null,
    titulo: 'Ya conoces Hola Clara.',
    desc: 'Clara está aquí cuando la necesites. Sin presión, sin streaks agresivos. A tu ritmo.',
    accion: null,
    tipo: 'cierre',
  },
]

export default function TourGuiado({ onComplete }) {
  const router = useRouter()
  const pathname = usePathname()
  const [pasoIdx, setPasoIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  const paso = PASOS[pasoIdx]

  // Avanzar cuando la ruta cambia al tab correcto (para instrucciones de navegación)
  useEffect(() => {
    if (paso?.tipo === 'instruccion' && pathname === paso.nextTab) {
      setTimeout(() => setPasoIdx(i => i + 1), 500)
    }
  }, [pathname, pasoIdx])

  const avanzar = () => {
    if (pasoIdx >= PASOS.length - 1) {
      setVisible(false)
      onComplete()
      return
    }
    if (paso.tipo === 'instruccion') return // espera que naveguen
    setPasoIdx(i => i + 1)
  }

  if (!visible || pathname === '/holaclara/onboarding') return null

  // Solo mostrar si estamos en la ruta correcta del paso
  if (paso.ruta && !pathname?.includes(paso.ruta.split('/').pop())) return null

  const tooltipStyle = paso.posicion === 'bottom'
    ? { bottom: '160px', left: '20px', right: '20px' }
    : paso.posicion === 'center'
    ? { top: '50%', left: '20px', right: '20px', transform: 'translateY(-50%)' }
    : { top: paso.highlight ? `calc(${Object.values(paso.highlight)[0]} + 120px)` : '200px', left: '20px', right: '20px' }

  return (
    <>
      {/* Overlay oscuro */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, pointerEvents: paso.tipo === 'instruccion' ? 'none' : 'auto' }} onClick={paso.tipo === 'instruccion' ? undefined : avanzar} />

      {/* Highlight del elemento */}
      {paso.highlight && (
        <div style={{ position: 'fixed', ...paso.highlight, zIndex: 201, boxShadow: '0 0 0 4px #C9A96E, 0 0 0 8px rgba(201,169,110,0.3)', pointerEvents: 'auto', cursor: 'pointer' }} onClick={avanzar} />
      )}

      {/* Tooltip */}
      <div style={{ position: 'fixed', ...tooltipStyle, zIndex: 202, background: '#FAFAF7', borderRadius: '20px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', pointerEvents: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Progreso */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
          {PASOS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: '2px', borderRadius: '1px', background: i <= pasoIdx ? '#C9A96E' : 'rgba(42,37,32,0.1)', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#C9A96E', fontWeight: 700, marginBottom: '6px' }}>
          {pasoIdx + 1} de {PASOS.length}
        </div>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', color: '#2A2520', marginBottom: '8px', lineHeight: 1.3 }}>
          {paso.titulo}
        </div>
        <div style={{ fontSize: '14px', color: '#6B6057', lineHeight: 1.6, marginBottom: '16px' }}>
          {paso.desc}
        </div>

        {paso.tipo === 'cierre' ? (
          <button onClick={() => { setVisible(false); onComplete() }} style={{ width: '100%', padding: '13px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Empezar con Clara →
          </button>
        ) : paso.tipo === 'instruccion' ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 14px', background: '#F5EFE6', borderRadius: '10px', border: '1px solid #C9A96E' }}>
            <div style={{ fontSize: '16px' }}>👆</div>
            <div style={{ fontSize: '13px', color: '#2A2520', fontWeight: 600 }}>{paso.accion}</div>
          </div>
        ) : (
          <button onClick={avanzar} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Continuar →
          </button>
        )}

        {paso.tipo !== 'instruccion' && paso.tipo !== 'cierre' && (
          <button onClick={() => { setVisible(false); onComplete() }} style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#9A8F84', marginTop: '6px', fontFamily: "'Inter Tight', sans-serif" }}>
            Saltar tour
          </button>
        )}
      </div>
    </>
  )
}
