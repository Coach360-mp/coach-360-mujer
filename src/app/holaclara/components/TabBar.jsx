'use client'
import { useRouter, usePathname } from 'next/navigation'

const TABS = [
  {
    id: 'chat',
    label: 'Clara',
    path: '/holaclara/chat',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 4 C4 3 5 2 6 2 L16 2 C17 2 18 3 18 4 L18 13 C18 14 17 15 16 15 L12 15 L8 19 L8 15 L6 15 C5 15 4 14 4 13 Z"
          stroke={active ? '#C9A96E' : '#9A8F84'} strokeWidth="1.5"
          fill={active ? 'rgba(201,169,110,0.12)' : 'none'} strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'conocerme',
    label: 'Conocerme',
    path: '/holaclara/conocerme',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 11 C11 11 11 8 14 8 C17 8 17 12 14 13 C11 14 8 13 7 10 C6 7 8 4 11 4 C15 4 18 7 18 11 C18 15.97 14.42 18 11 18 C6.58 18 4 14.97 4 11"
          stroke={active ? '#C9A96E' : '#9A8F84'} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 'yo',
    label: 'Yo',
    path: '/holaclara/yo',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.5" stroke={active ? '#C9A96E' : '#9A8F84'} strokeWidth="1.5" fill={active ? 'rgba(201,169,110,0.12)' : 'none'} />
        <path d="M5 19 C5 15.69 7.69 13 11 13 C14.31 13 17 15.69 17 19"
          stroke={active ? '#C9A96E' : '#9A8F84'} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: 'cuenta',
    label: 'Cuenta',
    path: '/holaclara/cuenta',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="3" stroke={active ? '#C9A96E' : '#9A8F84'} strokeWidth="1.5" fill={active ? 'rgba(201,169,110,0.12)' : 'none'} />
        <path d="M11 2 L11 4 M11 18 L11 20 M2 11 L4 11 M18 11 L20 11 M4.93 4.93 L6.34 6.34 M15.66 15.66 L17.07 17.07 M17.07 4.93 L15.66 6.34 M6.34 15.66 L4.93 17.07"
          stroke={active ? '#C9A96E' : '#9A8F84'} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function TabBar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <>
      <div style={{ height: '72px' }} />
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#FAFAF7', borderTop: '0.5px solid rgba(42,37,32,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 0 env(safe-area-inset-bottom, 8px)',
        zIndex: 100,
      }}>
        {TABS.map(tab => {
          const active = pathname?.startsWith(tab.path)
          return (
            <button key={tab.id} onClick={() => router.push(tab.path)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 12px', borderRadius: '12px',
            }}>
              {tab.icon(active)}
              <span style={{
                fontSize: '9px', fontFamily: "'Inter Tight', sans-serif",
                fontWeight: active ? 700 : 400, color: active ? '#C9A96E' : '#9A8F84', letterSpacing: '0.3px',
              }}>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
