'use client'

// TabBar horizontal — se muestra arriba del CoachDashboard.
// `tabs`: array { id, label, visible, preview, dataV } filtrados por género/plan.
// `active`: id activo. `onChange(id)`.

export default function TabBar({ tabs, active, onChange }) {
  return (
    <div
      className="dir-ritual"
      data-v={tabs.find(t => t.id === active)?.dataV || 'leo'}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--line)',
        padding: '12px 16px',
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      <style>{`.tabbar-scroll::-webkit-scrollbar { display: none; }`}</style>
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: '1px solid ' + (isActive ? 'var(--v-primary)' : 'var(--line)'),
              background: isActive ? 'var(--v-primary)' : 'var(--ink-2)',
              color: isActive ? '#0a0c0e' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <span>{tab.label}</span>
            {tab.preview && (
              <span style={{
                fontSize: 9,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '.08em',
                background: isActive ? 'rgba(0,0,0,.18)' : 'var(--ink-3)',
                color: isActive ? '#0a0c0e' : 'var(--text-dim)',
                padding: '2px 6px',
                borderRadius: 999,
                fontWeight: 700,
              }}>PRO</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
