
# GENERAL
with open('src/app/general/dashboard/page.js', 'r') as f:
    g = f.read()

if 'progresoModulos' not in g:
    g = g.replace(
        "  const [isRecording, setIsRecording] = useState(false)",
        "  const [isRecording, setIsRecording] = useState(false)\n  const [progresoModulos, setProgresoModulos] = useState([])",
        1
    )

if 'progreso_modulos' not in g:
    g = g.replace(
        "    if (m) setModulos(m)",
        "    if (m) setModulos(m)\n    const { data: prog } = await supabase.from('progreso_modulos').select('*').eq('usuario_id', user.id)\n    if (prog) setProgresoModulos(prog)",
        1
    )

old_g = "                {modulos.slice(0, 3).map(m => (\n                  <div key={m.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, cursor: 'pointer' }}>\n                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: '#fff' }}>{m.titulo}</p>\n                    <p style={{ fontSize: 12, color: '#a8a8a8' }}>{m.numero_lecciones || 0} lecciones \xb7 {m.categoria}</p>\n                  </div>\n                ))}"

new_g = """                {modulos.slice(0, 3).map(m => {
                  const prog = progresoModulos?.find(p => p.modulo_id === m.id)
                  const pct = prog?.porcentaje_avance || 0
                  const completado = prog?.completado || false
                  return (
                  <div key={m.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: pct > 0 ? 10 : 0 }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: '#fff' }}>{m.titulo}</p>
                        <p style={{ fontSize: 12, color: '#a8a8a8' }}>{completado ? '\u2713 Completado' : pct > 0 ? `${pct}% avanzado` : `${m.numero_lecciones || 0} lecciones`}</p>
                      </div>
                      {completado ? <span style={{ color: '#14b8a6', fontSize: 14 }}>\u2746</span> : <span style={{ color: '#14b8a6', fontSize: 14 }}>\u2192</span>}
                    </div>
                    {pct > 0 && !completado && (
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#14b8a6', borderRadius: 4, transition: 'width 0.5s ease' }} />
                      </div>
                    )}
                    {completado && (
                      <div style={{ height: 4, background: 'rgba(20,184,166,0.2)', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: '100%', background: '#14b8a6', borderRadius: 4 }} />
                      </div>
                    )}
                  </div>
                )})}"""

if old_g in g:
    g = g.replace(old_g, new_g, 1)
    print("OK General cards")
else:
    print("FAIL General cards")

with open('src/app/general/dashboard/page.js', 'w') as f:
    f.write(g)

# LIDERES
with open('src/app/lideres/dashboard/page.js', 'r') as f:
    l = f.read()

if 'progresoModulos' not in l:
    l = l.replace(
        "  const [isRecording, setIsRecording] = useState(false)",
        "  const [isRecording, setIsRecording] = useState(false)\n  const [progresoModulos, setProgresoModulos] = useState([])",
        1
    )

if 'progreso_modulos' not in l:
    l = l.replace(
        "    if (m) setModulos(m)",
        "    if (m) setModulos(m)\n    const { data: prog } = await supabase.from('progreso_modulos').select('*').eq('usuario_id', user.id)\n    if (prog) setProgresoModulos(prog)",
        1
    )

old_l = "                {modulos.slice(0, 3).map(m => (\n                  <div key={m.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, padding: 16, cursor: 'pointer' }}>\n                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: '#fff' }}>{m.titulo}</p>\n                    <p style={{ fontSize: 12, color: '#a8a8a8' }}>{m.numero_lecciones || 0} lecciones \xb7 {m.categoria}</p>\n                  </div>\n                ))}"

new_l = """                {modulos.slice(0, 3).map(m => {
                  const prog = progresoModulos?.find(p => p.modulo_id === m.id)
                  const pct = prog?.porcentaje_avance || 0
                  const completado = prog?.completado || false
                  return (
                  <div key={m.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, padding: 16, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: pct > 0 ? 10 : 0 }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: '#fff' }}>{m.titulo}</p>
                        <p style={{ fontSize: 12, color: '#a8a8a8' }}>{completado ? '\u2713 Completado' : pct > 0 ? `${pct}% avanzado` : `${m.numero_lecciones || 0} lecciones`}</p>
                      </div>
                      {completado ? <span style={{ color: '#818cf8', fontSize: 14 }}>\u2746</span> : <span style={{ color: '#818cf8', fontSize: 14 }}>\u2192</span>}
                    </div>
                    {pct > 0 && !completado && (
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#818cf8', borderRadius: 4, transition: 'width 0.5s ease' }} />
                      </div>
                    )}
                    {completado && (
                      <div style={{ height: 4, background: 'rgba(129,140,248,0.2)', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: '100%', background: '#818cf8', borderRadius: 4 }} />
                      </div>
                    )}
                  </div>
                )})}"""

if old_l in l:
    l = l.replace(old_l, new_l, 1)
    print("OK Lideres cards")
else:
    print("FAIL Lideres cards")

with open('src/app/lideres/dashboard/page.js', 'w') as f:
    f.write(l)
