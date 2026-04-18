with open('src/app/onboarding/page.js', 'r') as f:
    content = f.read()

# 1. Agregar estado para avatar y estilo coach
old_state = "  const [nombre, setNombre] = useState('')"
new_state = """  const [nombre, setNombre] = useState('')
  const [nombrePreferido, setNombrePreferido] = useState('')
  const [avatarSel, setAvatarSel] = useState(null)
  const [estiloCoach, setEstiloCoach] = useState(null)"""

content = content.replace(old_state, new_state, 1)

# 2. Reemplazar paso 1 con nombre + avatar + nombre preferido
old_paso1 = """        {step === 1 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Empecemos
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Cómo te llamas?
            </h2>
            <p style={{ fontSize: 14, color: '#a8a8a8', textAlign: 'center', marginBottom: 40 }}>
              Tu coach te va a tratar por tu nombre
            </p>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(212, 175, 55, 0.06)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 14,
                padding: '18px 20px',
                color: '#fff',
                fontSize: 18,
                textAlign: 'center',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
        )}"""

new_paso1 = """        {step === 1 && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: '#d4af37', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
              Empecemos
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, lineHeight: 1.3, marginBottom: 12, textAlign: 'center' }}>
              ¿Cómo te llamas?
            </h2>
            <p style={{ fontSize: 14, color: '#a8a8a8', textAlign: 'center', marginBottom: 28 }}>
              Tu coach te va a tratar por tu nombre
            </p>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
              autoFocus
              style={{ width: '100%', background: 'rgba(212, 175, 55, 0.06)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 14, padding: '18px 20px', color: '#fff', fontSize: 18, textAlign: 'center', fontFamily: 'inherit', outline: 'none', marginBottom: 16 }}
            />
            <input
              type="text"
              value={nombrePreferido}
              onChange={(e) => setNombrePreferido(e.target.value)}
              placeholder="\u00bfC\u00f3mo quieres que te llame Clara? (opcional)"
              style={{ width: '100%', background: 'rgba(212, 175, 55, 0.04)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 14, padding: '14px 20px', color: '#fff', fontSize: 15, textAlign: 'center', fontFamily: 'inherit', outline: 'none', marginBottom: 32 }}
            />
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginBottom: 16 }}>Elige tu avatar</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              {['\u{1F331}','\u{1F525}','\u{1F30A}','\u{1F300}','\u2728','\u{1F98B}','\u{1F333}','\u{1F319}'].map(a => (
                <button key={a} onClick={() => setAvatarSel(a)} style={{ width: 52, height: 52, borderRadius: '50%', border: avatarSel === a ? '2px solid #d4af37' : '2px solid rgba(255,255,255,0.1)', background: avatarSel === a ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)', fontSize: 24, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}"""

if old_paso1 in content:
    content = content.replace(old_paso1, new_paso1, 1)
    print("OK paso 1")
else:
    print("FAIL paso 1")

# 3. Agregar estilo de coach al final del paso 6
old_paso6_end = """            />
          </div>
        )}

        {/* Paso 7: Cierre */}"""

new_paso6_end = """            />
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginTop: 32, marginBottom: 16 }}>\u00bfC\u00f3mo prefieres que te acompa\u00f1e Clara?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { val: 'preguntas', label: 'Con preguntas que me hagan pensar' },
                { val: 'estructura', label: 'Con estructura y pasos concretos' },
                { val: 'desafios', label: 'Con desaf\u00edos que me saquen de la zona c\u00f3moda' },
                { val: 'calma', label: 'Con calma y sin presi\u00f3n' },
              ].map(e => (
                <button key={e.val} onClick={() => setEstiloCoach(e.val)} style={{ background: estiloCoach === e.val ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.04)', border: estiloCoach === e.val ? '1px solid #d4af37' : '1px solid rgba(212,175,55,0.2)', borderRadius: 14, padding: '14px 20px', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s' }}>
                  {estiloCoach === e.val ? '\u2714 ' : ''}{e.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paso 7: Cierre */}"""

if old_paso6_end in content:
    content = content.replace(old_paso6_end, new_paso6_end, 1)
    print("OK paso 6")
else:
    print("FAIL paso 6")

# 4. Guardar avatar, nombre preferido y estilo coach en Supabase
old_save = "        nombre: nombre || user.user_metadata?.full_name || '',"
new_save = """        nombre: nombre || user.user_metadata?.full_name || '',
        nombre_preferido: nombrePreferido || nombre || '',
        avatar: avatarSel || '\u2728',"""

if old_save in content:
    content = content.replace(old_save, new_save, 1)
    print("OK guardado perfil")
else:
    print("FAIL guardado perfil")

# 5. Guardar estilo coach en user_context
old_context = "        vertical: 'mujer',"
new_context = """        vertical: 'mujer',
        estilo_coach: estiloCoach || 'preguntas',"""

# Solo reemplazar la primera ocurrencia en el área de guardado
idx = content.find("vertical: 'mujer',")
if idx > -1:
    content = content[:idx] + content[idx:].replace("        vertical: 'mujer',", new_context, 1)
    print("OK estilo coach")

with open('src/app/onboarding/page.js', 'w') as f:
    f.write(content)

print("DONE")
