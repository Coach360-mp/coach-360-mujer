'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  'https://fllekyrbehkayrnnnjpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGVreXJiZWhrYXlybm5uanB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTg4MzAsImV4cCI6MjA5MDgzNDgzMH0.CyDyp3ztZf6Tr9QVJWFV3Qo2o0PsNiejIAp-t_Va1pE'
)

const POOL = {
  mente: [
    { n: 'Escribir 3 intenciones del día', img: '/images/10_mano_naranja.jpg' },
    { n: 'Desconectarme del trabajo a tiempo', img: '/images/13_gradiente_turrell_naranja.jpg' },
    { n: 'Aprender algo nuevo', img: '/images/12_desayuno_sol.jpg' },
    { n: 'Revisar mis valores', img: '/images/09_espigas_mar.jpg' },
  ],
  cuerpo: [
    { n: 'Caminar 20 minutos', img: '/images/09_espigas_mar.jpg' },
    { n: 'Tomar 2 litros de agua', img: '/images/10_mano_naranja.jpg' },
    { n: 'Dormir antes de las 23h', img: '/images/13_gradiente_turrell_naranja.jpg' },
    { n: 'Moverme al despertar', img: '/images/12_desayuno_sol.jpg' },
  ],
  corazon: [
    { n: 'Escribir en mi diario', img: '/images/11_mujer_leyendo_jardin.jpg' },
    { n: 'Tiempo sin pantallas', img: '/images/17_gradiente_turrell_rojo.jpg' },
    { n: 'Llamar a alguien que quiero', img: '/images/15_mujer_pecosa.jpg' },
    { n: 'Hacer algo solo para mí', img: '/images/13_gradiente_turrell_naranja.jpg' },
  ],
  espiritu: [
    { n: 'Meditar 5 minutos', img: '/images/12_desayuno_sol.jpg' },
    { n: 'Momento de gratitud', img: '/images/09_espigas_mar.jpg' },
    { n: 'Leer algo que me nutra', img: '/images/11_mujer_leyendo_jardin.jpg' },
    { n: 'Tiempo en silencio', img: '/images/17_gradiente_turrell_rojo.jpg' },
  ],
}

const CAT_COLORS = { mente: '#378ADD', cuerpo: '#D85A30', corazon: '#7F77DD', espiritu: '#5DCAA5' }
const CAT_LABELS = { mente: 'Mente', cuerpo: 'Cuerpo', corazon: 'Corazón', espiritu: 'Espíritu' }
const ILLUS_BG = { mente: '#E6F1FB', cuerpo: '#FAECE7', corazon: '#EEEDFE', espiritu: '#E1F5EE' }
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const FRECUENCIAS = ['Todos los días', 'Días de semana', 'Fines de semana', 'Personalizado']
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function HabitosPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [habitos, setHabitos] = useState([])
  const [completadosHoy, setCompletadosHoy] = useState([])
  const [cargando, setCargando] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selCat, setSelCat] = useState(null)
  const [selHabit, setSelHabit] = useState(null)
  const [selImg, setSelImg] = useState(null)
  const [selFreq, setSelFreq] = useState('Todos los días')
  const [diasPersonalizados, setDiasPersonalizados] = useState([])
  const [customInput, setCustomInput] = useState('')
  const diaHoy = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  useEffect(() => { inicializar() }, [])

  async function inicializar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/holaclara/auth'); return }
    setUsuario(user)
    await cargarHabitos(user.id)
    setCargando(false)
  }

  async function cargarHabitos(userId) {
    const hoy = new Date().toISOString().split('T')[0]
    const { data: habitosData } = await supabase
      .from('habitos_usuario')
      .select('*')
      .eq('user_id', userId)
      .eq('activo', true)
      .order('created_at', { ascending: true })

    const { data: completadosData } = await supabase
      .from('habitos_completados')
      .select('habito_id')
      .eq('user_id', userId)
      .eq('fecha', hoy)

    setHabitos(habitosData || [])
    setCompletadosHoy((completadosData || []).map(c => c.habito_id))
  }

  async function toggleHabito(habitoId) {
    if (!usuario) return
    const hoy = new Date().toISOString().split('T')[0]
    const yaCompletado = completadosHoy.includes(habitoId)

    if (yaCompletado) {
      await supabase.from('habitos_completados').delete()
        .eq('user_id', usuario.id).eq('habito_id', habitoId).eq('fecha', hoy)
      setCompletadosHoy(prev => prev.filter(id => id !== habitoId))
    } else {
      await supabase.from('habitos_completados').insert({ user_id: usuario.id, habito_id: habitoId, fecha: hoy })
      setCompletadosHoy(prev => [...prev, habitoId])
    }
  }

  async function agregarHabito() {
    const nombre = customInput.trim() || (selHabit ? selHabit.n : null)
    if (!selCat || !nombre || !usuario) return
    if (habitos.length >= 3) return

    const diasMap = {
      'Todos los días': [1, 2, 3, 4, 5, 6, 7],
      'Días de semana': [1, 2, 3, 4, 5],
      'Fines de semana': [6, 7],
      'Personalizado': diasPersonalizados.length > 0 ? diasPersonalizados : [1, 2, 3, 4, 5, 6, 7],
    }

    const frecuenciaLabel = selFreq === 'Personalizado'
      ? diasPersonalizados.map(d => DIAS_SEMANA[d-1]).join(', ')
      : selFreq

    const { data } = await supabase.from('habitos_usuario').insert({
      user_id: usuario.id,
      dimension: selCat,
      nombre,
      imagen: customInput.trim() ? null : selImg,
      frecuencia: frecuenciaLabel,
      dias_semana: diasMap[selFreq] || [1, 2, 3, 4, 5, 6, 7],
      activo: true,
    }).select().single()

    if (data) setHabitos(prev => [...prev, data])
    setShowModal(false)
    setSelCat(null); setSelHabit(null); setSelImg(null)
    setCustomInput(''); setSelFreq('Todos los días'); setDiasPersonalizados([])
  }

  const completadosCount = completadosHoy.length

  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520', overflowX: 'hidden' },
    container: { maxWidth: '420px', margin: '0 auto' },
    nav: { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(42,37,32,0.08)' },
    logoText: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '20px', lineHeight: 1 },
    goldLine: { height: '1px', background: '#C9A96E', margin: '2px 0' },
    navLabel: { fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700 },
    backBtn: { padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(42,37,32,0.2)', background: 'transparent', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: '#2A2520' },
    body: { padding: '24px 20px' },
    eyebrow: { fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700, marginBottom: '4px' },
    mainTitle: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '28px', marginBottom: '4px' },
    caveatSub: { fontFamily: "'Caveat', cursive", fontSize: '16px', color: '#C9A96E', marginBottom: '24px' },
    cardsScroll: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px', scrollbarWidth: 'none' },
    card: { flexShrink: 0, width: '150px', borderRadius: '18px', overflow: 'hidden', position: 'relative', cursor: 'pointer' },
    cardImg: { width: '100%', height: '190px', objectFit: 'cover', display: 'block' },
    cardIllus: (cat) => ({ width: '100%', height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: ILLUS_BG[cat] }),
    cardOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' },
    cardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 12px' },
    cardCat: { fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '3px' },
    cardName: { fontSize: '13px', fontWeight: 700, color: '#fff', lineHeight: 1.25 },
    cardFreq: { fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' },
    checkBtn: (done) => ({
      position: 'absolute', top: '10px', right: '10px',
      width: '26px', height: '26px', borderRadius: '50%',
      border: done ? 'none' : '2px solid rgba(255,255,255,0.4)',
      background: done ? '#C9A96E' : 'rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.15s',
    }),
    weekSection: { marginBottom: '24px' },
    weekLabel: { fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700, marginBottom: '12px' },
    weekRow: { display: 'flex', gap: '4px' },
    wDay: { flex: 1, textAlign: 'center' },
    wCircle: (state) => ({
      width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto 4px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '11px', fontWeight: 700,
      background: state === 'done' ? '#C9A96E' : state === 'today' ? 'transparent' : 'rgba(42,37,32,0.07)',
      color: state === 'done' ? '#fff' : state === 'today' ? '#C9A96E' : 'rgba(42,37,32,0.25)',
      border: state === 'today' ? '2px solid #C9A96E' : 'none',
    }),
    wName: { fontSize: '9px', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.5px' },
    addBtn: { width: '100%', padding: '14px', borderRadius: '14px', border: '1.5px dashed rgba(42,37,32,0.18)', background: 'transparent', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: 'rgba(42,37,32,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(42,37,32,0.55)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
    modal: { background: '#FAFAF7', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto' },
    modalTitle: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '22px', marginBottom: '2px' },
    modalSub: { fontSize: '12px', opacity: 0.35, marginBottom: '18px' },
    catGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' },
    catBtn: (sel) => ({ padding: '10px 12px', borderRadius: '12px', border: sel ? '1.5px solid #C9A96E' : '1px solid rgba(42,37,32,0.12)', background: sel ? '#FBF5EC' : '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#2A2520' }),
    catDot: (color) => ({ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }),
    poolLabel: { fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.35, fontWeight: 700, marginBottom: '8px' },
    poolList: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', marginBottom: '12px' },
    poolItem: (sel) => ({ padding: '11px 14px', borderRadius: '10px', border: sel ? '1px solid #C9A96E' : '0.5px solid rgba(42,37,32,0.1)', background: sel ? '#FBF5EC' : '#fff', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }),
    poolThumb: { width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
    orLine: { textAlign: 'center', fontSize: '11px', opacity: 0.25, margin: '10px 0' },
    customIn: { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '0.5px solid rgba(42,37,32,0.15)', background: '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '13px', color: '#2A2520', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' },
    freqRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' },
    freqBtn: (sel) => ({ padding: '7px 14px', borderRadius: '20px', border: '0.5px solid rgba(42,37,32,0.15)', background: sel ? '#2A2520' : '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', cursor: 'pointer', color: sel ? '#FAFAF7' : '#2A2520' }),
    confirmBtn: { width: '100%', padding: '14px', borderRadius: '12px', background: '#2A2520', color: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' },
  }

  const getDiaState = (idx) => {
    if (idx < diaHoy) return 'done'
    if (idx === diaHoy) return 'today'
    return 'empty'
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF7', fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', color: '#C9A96E' }}>
      cargando...
    </div>
  )

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400;1,600&family=Inter+Tight:wght@400;700&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <div style={s.container}>
          <nav style={s.nav}>
            <div>
              <div style={s.logoText}>Clara</div>
              <div style={s.goldLine} />
            </div>
            <div style={s.navLabel}>Hábitos</div>
            <button style={s.backBtn} onClick={() => router.push('/holaclara/chat')}>← volver</button>
          </nav>

          <div style={s.body}>
            <div style={s.eyebrow}>{new Date().toLocaleDateString('es-CL', { weekday: 'long' })}</div>
            <div style={s.mainTitle}>Tus hábitos</div>
            <div style={s.caveatSub}>{completadosCount} de {habitos.length} completados</div>

            {habitos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.4 }}>
                <p style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '18px', marginBottom: '8px' }}>Aún no tienes hábitos</p>
                <p style={{ fontSize: '13px' }}>Agrega hasta 3 para empezar</p>
              </div>
            ) : (
              <div style={s.cardsScroll}>
                {habitos.map(h => {
                  const done = completadosHoy.includes(h.id)
                  return (
                    <div key={h.id} style={s.card}>
                      {h.imagen
                        ? <img src={h.imagen} alt="" style={s.cardImg} />
                        : <div style={s.cardIllus(h.dimension)}>
                            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                              <circle cx="26" cy="26" r="20" stroke={CAT_COLORS[h.dimension]} strokeWidth="1.5" strokeDasharray="5 3" />
                              <circle cx="26" cy="26" r="7" fill={CAT_COLORS[h.dimension]} opacity="0.4" />
                            </svg>
                          </div>
                      }
                      <div style={s.cardOverlay} />
                      <div style={s.cardContent}>
                        <div style={s.cardCat}>{CAT_LABELS[h.dimension]}</div>
                        <div style={s.cardName}>{h.nombre}</div>
                        <div style={s.cardFreq}>{h.frecuencia || 'Todos los días'}</div>
                      </div>
                      <button style={s.checkBtn(done)} onClick={() => toggleHabito(h.id)}>
                        {done && (
                          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                            <polyline points="1,5 4.5,8.5 11,1.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <div style={s.weekSection}>
              <div style={s.weekLabel}>Esta semana</div>
              <div style={s.weekRow}>
                {DIAS.map((d, i) => (
                  <div key={d} style={s.wDay}>
                    <div style={s.wCircle(getDiaState(i))}>{d[0]}</div>
                    <div style={s.wName}>{d.toLowerCase()}</div>
                  </div>
                ))}
              </div>
            </div>

            {habitos.length < 3 ? (
              <button style={s.addBtn} onClick={() => setShowModal(true)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="7" y1="1" x2="7" y2="13" stroke="rgba(42,37,32,0.35)" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="1" y1="7" x2="13" y2="7" stroke="rgba(42,37,32,0.35)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Agregar hábito
              </button>
            ) : (
              <p style={{ textAlign: 'center', fontSize: '12px', opacity: 0.35 }}>Máximo 3 hábitos activos</p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div style={s.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={s.modal}>
            <div style={s.modalTitle}>Nuevo hábito</div>
            <div style={s.modalSub}>Elige una categoría para empezar</div>
            <div style={s.catGrid}>
              {Object.entries(CAT_LABELS).map(([key, label]) => (
                <button key={key} style={s.catBtn(selCat === key)} onClick={() => { setSelCat(key); setSelHabit(null); setSelImg(null); setCustomInput('') }}>
                  <span style={s.catDot(CAT_COLORS[key])} />{label}
                </button>
              ))}
            </div>
            {selCat && (
              <>
                <div style={s.poolLabel}>Elige del banco</div>
                <div style={s.poolList}>
                  {POOL[selCat].map((item) => (
                    <div key={item.n} style={s.poolItem(selHabit?.n === item.n)} onClick={() => { setSelHabit(item); setSelImg(item.img); setCustomInput('') }}>
                      <img src={item.img} alt="" style={s.poolThumb} />
                      <span>{item.n}</span>
                    </div>
                  ))}
                </div>
                <div style={s.orLine}>— o escribe el tuyo —</div>
                <input style={s.customIn} placeholder="Ej: Salir a caminar al parque" value={customInput}
                  onChange={(e) => { setCustomInput(e.target.value); setSelHabit(null); setSelImg(null) }} />
                <div style={s.poolLabel}>Frecuencia</div>
                <div style={s.freqRow}>
                  {FRECUENCIAS.map(f => (
                    <button key={f} style={s.freqBtn(selFreq === f)} onClick={() => setSelFreq(f)}>{f}</button>
                  ))}
                </div>
                {selFreq === 'Personalizado' && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {DIAS_SEMANA.map((dia, i) => {
                      const num = i + 1
                      const sel = diasPersonalizados.includes(num)
                      return (
                        <button key={dia} onClick={() => setDiasPersonalizados(prev => sel ? prev.filter(d => d !== num) : [...prev, num])}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid', borderColor: sel ? '#C9A96E' : 'rgba(42,37,32,0.15)', background: sel ? '#FBF5EC' : '#fff', fontFamily: "'Inter Tight', sans-serif", fontSize: '11px', fontWeight: 700, color: sel ? '#C9A96E' : '#2A2520', cursor: 'pointer' }}>
                          {dia}
                        </button>
                      )
                    })}
                  </div>
                )}
                <button style={s.confirmBtn} onClick={agregarHabito}>Agregar hábito</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
