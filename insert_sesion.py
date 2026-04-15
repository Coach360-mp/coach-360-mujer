with open('src/app/dashboard/page.js', 'r') as f:
    content = f.read()

old = "  if (loading) return ("

nueva_sesion = '''
  const completarPrimeraSesion = async () => {
    if (user) {
      await supabase.from('perfiles').update({ primera_sesion_completada: true }).eq('id', user.id)
      if (sesionAnimo) {
        await supabase.from('daily_checkins').insert({ user_id: user.id, vertical: 'mujer', mood: sesionAnimo, created_at: new Date().toISOString() })
      }
      const currentCoach = coaches[perfil?.plan_actual || 'free']
      setChatMsgs([{ r: 'a', t: `Hola, ${perfil?.nombre || 'bienvenida'} ✦\\n\\nYa sé un poco sobre ti y estoy lista para acompañarte. ¿Qué quieres explorar hoy?` }])
    }
    setPrimeraSesion(false)
    setView('clara')
  }

  const animosSesion = [
    { valor: 5, emoji: '✨', label: 'Excelente' },
    { valor: 4, emoji: '😊', label: 'Bien' },
    { valor: 3, emoji: '😐', label: 'Regular' },
    { valor: 2, emoji: '😔', label: 'Difícil' },
    { valor: 1, emoji: '🌧', label: 'Muy difícil' },
  ]

  const tourSlides = [
    { titulo: 'Tests de autoconocimiento', descripcion: 'Cada test que completes alimenta las conversaciones con tu coach. Mientras más hagas, más personalizado se vuelve el acompañamiento.', icono: '🧪' },
    { titulo: 'Hábitos diarios', descripcion: 'Tu coach sabe qué hábitos tienes configurados y cuántos días los cumpliste. No para juzgarte — para acompañarte mejor.', icono: '💚' },
    { titulo: 'Herramientas prácticas', descripcion: 'Ejercicios para generar cambios reales. Tu reflexión queda guardada y tu coach puede usarla contigo en el momento oportuno.', icono: '🛠' },
  ]

  if (primerasSesion) return (
    <div style={{ minHeight: '100vh', background: 'var(--warm)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 3, background: '#f0e8d8', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div style={{ height: '100%', background: 'var(--gold)', transition: 'width 0.4s ease', width: sesionMostrarTour ? `${50 + (sesionTourPaso + 1) * 16}%` : sesionPaso === 0 ? '20%' : '40%' }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px 40px' }}>

        {sesionPaso === 0 && !sesionMostrarTour && (
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <img src="/clara.jpg" alt="Clara" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold-light)', marginBottom: 24 }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 12, color: 'var(--text)' }}>Hola, {perfil?.nombre || 'bienvenida'} ✦</h1>
            <p style={{ fontSize: 16, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 8 }}>Soy Clara, tu coach en Coach 360.</p>
            <p style={{ fontSize: 15, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 36 }}>Antes de empezar, hagamos dos cosas juntas. Solo toma un momento.</p>
            <button onClick={() => setSesionPaso(1)} style={{ background: 'var(--dark)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px 40px', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Empecemos →</button>
          </div>
        )}

        {sesionPaso === 1 && !sesionMostrarTour && (
          <div style={{ textAlign: 'center', maxWidth: 360, width: '100%' }}>
            <p style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Check-in de bienvenida</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 8, color: 'var(--text)' }}>¿Cómo llegaste hoy?</h2>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 32 }}>Tu primer registro del día. Arranca tu racha.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {animosSesion.map(a => (
                <button key={a.valor} onClick={() => { setSesionAnimo(a.valor); setSesionMostrarTour(true) }}
                  style={{ background: sesionAnimo === a.valor ? 'var(--dark)' : '#fff', color: sesionAnimo === a.valor ? '#fff' : 'var(--text)', border: '1.5px solid #e8e0d6', borderRadius: 16, padding: '16px 20px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}>
                  <span style={{ fontSize: 24 }}>{a.emoji}</span>
                  <span style={{ fontWeight: 500 }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {sesionMostrarTour && (
          <div style={{ textAlign: 'center', maxWidth: 360, width: '100%' }}>
            <p style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24 }}>Tu app</p>
            <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{tourSlides[sesionTourPaso].icono}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12, color: 'var(--text)' }}>{tourSlides[sesionTourPaso].titulo}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.7 }}>{tourSlides[sesionTourPaso].descripcion}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
              {tourSlides.map((_, i) => (
                <div key={i} style={{ width: i === sesionTourPaso ? 24 : 8, height: 8, borderRadius: 4, background: i === sesionTourPaso ? 'var(--gold)' : '#e8e0d6', transition: 'all 0.3s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sesionTourPaso < tourSlides.length - 1 ? (
                <button onClick={() => setSesionTourPaso(sesionTourPaso + 1)} style={{ background: 'var(--dark)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px 40px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Siguiente →</button>
              ) : (
                <button onClick={completarPrimeraSesion} style={{ background: 'var(--dark)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px 40px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Hablar con Clara ✦</button>
              )}
              <button onClick={completarPrimeraSesion} style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: 13, cursor: 'pointer', padding: 8 }}>Saltar tour →</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )

  if (loading) return ('''

if old in content:
    content = content.replace(old, nueva_sesion, 1)
    with open('src/app/dashboard/page.js', 'w') as f:
        f.write(content)
    print("✅ Primera sesión guiada insertada")
else:
    print("❌ No encontró el patrón")
