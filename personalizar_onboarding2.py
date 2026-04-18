# -*- coding: utf-8 -*-
with open('src/app/onboarding/page.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Agregar estados
old_state = "  const [nombre, setNombre] = useState('')"
new_state = "  const [nombre, setNombre] = useState('')\n  const [nombrePreferido, setNombrePreferido] = useState('')\n  const [avatarSel, setAvatarSel] = useState(None)\n  const [estiloCoach, setEstiloCoach] = useState(None)"
new_state = new_state.replace("None", "null")

if old_state in content:
    content = content.replace(old_state, new_state, 1)
    print("OK estados")
else:
    print("FAIL estados")

# 2. Agregar nombre preferido y avatares al paso 1
old_input = """              placeholder="Tu nombre"
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
        )}

        {/* Paso 2: Momento de vida */}"""

new_input = """              placeholder="Tu nombre completo"
              autoFocus
              style={{ width: '100%', background: 'rgba(212, 175, 55, 0.06)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: 14, padding: '18px 20px', color: '#fff', fontSize: 18, textAlign: 'center', fontFamily: 'inherit', outline: 'none', marginBottom: 16 }}
            />
            <input
              type="text"
              value={nombrePreferido}
              onChange={(e) => setNombrePreferido(e.target.value)}
              placeholder="Como quieres que te llame Clara? (opcional)"
              style={{ width: '100%', background: 'rgba(212, 175, 55, 0.04)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: 14, padding: '14px 20px', color: '#fff', fontSize: 15, textAlign: 'center', fontFamily: 'inherit', outline: 'none', marginBottom: 28 }}
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
        )}

        {/* Paso 2: Momento de vida */}"""

if old_input in content:
    content = content.replace(old_input, new_input, 1)
    print("OK paso 1")
else:
    print("FAIL paso 1")

# 3. Agregar estilo de coach al final del paso 6
old_end6 = """            />
          </div>
        )}

        {/* Paso 7: Cierre */}"""

new_end6 = """            />
            <p style={{ fontSize: 13, color: '#a8a8a8', textAlign: 'center', marginTop: 28, marginBottom: 16 }}>Como prefieres que te acompane Clara?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { val: 'preguntas', label: 'Con preguntas que me hagan pensar' },
                { val: 'estructura', label: 'Con estructura y pasos concretos' },
                { val: 'desafios', label: 'Con desafios que me saquen de la zona comoda' },
                { val: 'calma', label: 'Con calma y sin presion' },
              ].map(e => (
                <button key={e.val} onClick={() => setEstiloCoach(e.val)} style={{ background: estiloCoach === e.val ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.04)', border: estiloCoach === e.val ? '1px solid #d4af37' : '1px solid rgba(212,175,55,0.2)', borderRadius: 14, padding: '14px 20px', color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s' }}>
                  {estiloCoach === e.val ? '\u2714 ' : ''}{e.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paso 7: Cierre */}"""

if old_end6 in content:
    content = content.replace(old_end6, new_end6, 1)
    print("OK paso 6")
else:
    print("FAIL paso 6")

# 4. Guardar en perfiles
old_save = "        nombre: nombre || user.user_metadata?.full_name || '',"
new_save = "        nombre: nombre || user.user_metadata?.full_name || '',\n        nombre_preferido: nombrePreferido || nombre || '',\n        avatar: avatarSel || '\u2728',"

if old_save in content:
    content = content.replace(old_save, new_save, 1)
    print("OK guardado")
else:
    print("FAIL guardado")

with open('src/app/onboarding/page.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("DONE")
