'use client'
import { useRouter } from 'next/navigation'

export default function PrivacidadPage() {
  const router = useRouter()
  const s = {
    root: { minHeight: '100vh', background: '#FAFAF7', fontFamily: "'Inter Tight', sans-serif", color: '#2A2520' },
    container: { maxWidth: '640px', margin: '0 auto', padding: '40px 24px 80px' },
    h1: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: '32px', color: '#2A2520', marginBottom: '8px', lineHeight: 1.2 },
    h2: { fontSize: '15px', fontWeight: 700, color: '#2A2520', marginTop: '32px', marginBottom: '8px' },
    p: { fontSize: '14px', color: '#6B6057', lineHeight: 1.8, marginBottom: '12px' },
    small: { fontSize: '12px', color: '#9A8F84', lineHeight: 1.7, marginBottom: '8px' },
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400&family=Inter+Tight:wght@400;700&display=swap" rel="stylesheet" />
      <div style={s.root}>
        <div style={s.container}>
          <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', fontSize: '13px', color: '#9A8F84', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '24px', padding: 0 }}>
            volver
          </button>

          <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#9A8F84', fontWeight: 700, marginBottom: '8px' }}>Hola Clara · MPR Studio SpA</div>
          <h1 style={s.h1}>Política de Privacidad</h1>
          <p style={s.small}>Última actualización: mayo 2026</p>

          <p style={s.p}>En Hola Clara nos importa profundamente tu privacidad. Esta política explica qué datos recopilamos, cómo los usamos y qué derechos tienes sobre ellos, de acuerdo a la Ley 19.628 sobre Protección de la Vida Privada de Chile.</p>

          <h2 style={s.h2}>1. Quién es responsable de tus datos</h2>
          <p style={s.p}>MPR Studio SpA (RUT 78.402.051-7), con domicilio en Santiago de Chile, es responsable del tratamiento de tus datos personales. Contacto: hola@holaclara.app</p>

          <h2 style={s.h2}>2. Qué datos recopilamos</h2>
          <p style={s.p}><strong>Datos de cuenta:</strong> nombre, dirección de email, método de autenticación (Google o email).</p>
          <p style={s.p}><strong>Datos de uso:</strong> conversaciones con Clara, rituales y journaling completados, hábitos, respuestas a tests, registro de ciclo menstrual (opcional), puntos y nivel de progreso.</p>
          <p style={s.p}><strong>Datos de pago:</strong> procesados exclusivamente por Mercado Pago. No almacenamos datos de tarjetas de crédito.</p>
          <p style={s.p}><strong>Datos técnicos:</strong> dirección IP, tipo de dispositivo, versión del sistema operativo, logs de errores.</p>

          <h2 style={s.h2}>3. Para qué usamos tus datos</h2>
          <p style={s.p}>Usamos tus datos para: proveer y mejorar el servicio de Hola Clara, personalizar el acompañamiento de Clara, enviarte comunicaciones relacionadas con tu cuenta (como el email de bienvenida y actualizaciones importantes), y procesar pagos.</p>
          <p style={s.p}>No vendemos tus datos a terceros. No usamos tus datos para publicidad.</p>

          <h2 style={s.h2}>4. Datos sensibles</h2>
          <p style={s.p}>El registro de ciclo menstrual y el contenido de tus conversaciones con Clara son datos sensibles conforme a la Ley 19.628. Solo los almacenamos con tu consentimiento explícito y únicamente para personalizar tu experiencia. Nunca los compartimos con terceros.</p>

          <h2 style={s.h2}>5. Con quién compartimos tus datos</h2>
          <p style={s.p}><strong>Supabase</strong> (base de datos, servidores en Brasil): almacenamiento seguro de tus datos.</p>
          <p style={s.p}><strong>Anthropic</strong> (API de IA): procesamiento de conversaciones con Clara. Los mensajes se envían de forma segura y no se usan para entrenar modelos sin consentimiento.</p>
          <p style={s.p}><strong>Resend</strong>: envío de emails transaccionales.</p>
          <p style={s.p}><strong>Mercado Pago</strong>: procesamiento de pagos.</p>
          <p style={s.p}><strong>Vercel</strong>: infraestructura de la aplicación.</p>

          <h2 style={s.h2}>6. Tus derechos</h2>
          <p style={s.p}>Conforme a la Ley 19.628 tienes derecho a: acceder a tus datos personales, rectificarlos si son incorrectos, cancelar su tratamiento y oponerte a usos específicos. Para ejercer estos derechos escríbenos a hola@holaclara.app y responderemos en un plazo máximo de 10 días hábiles.</p>

          <h2 style={s.h2}>7. Eliminación de cuenta</h2>
          <p style={s.p}>Puedes solicitar la eliminación completa de tu cuenta y todos tus datos escribiendo a hola@holaclara.app. Procesamos las solicitudes en un plazo máximo de 10 días hábiles.</p>

          <h2 style={s.h2}>8. Seguridad</h2>
          <p style={s.p}>Usamos cifrado en tránsito (HTTPS) y en reposo. El acceso a los datos está restringido por roles y autenticación. Aplicamos Row Level Security en nuestra base de datos para que cada usuaria solo pueda acceder a sus propios datos.</p>

          <h2 style={s.h2}>9. Cookies</h2>
          <p style={s.p}>Usamos cookies técnicas necesarias para el funcionamiento de la aplicación (sesión de autenticación). No usamos cookies de seguimiento ni publicidad.</p>

          <h2 style={s.h2}>10. Cambios a esta política</h2>
          <p style={s.p}>Si realizamos cambios significativos a esta política, te notificaremos por email con al menos 15 días de anticipación.</p>

          <h2 style={s.h2}>11. Contacto</h2>
          <p style={s.p}>Para cualquier consulta sobre privacidad: <a href="mailto:hola@holaclara.app" style={{ color: '#C9A96E' }}>hola@holaclara.app</a></p>

          <div style={{ marginTop: '48px', padding: '20px', background: '#F5EFE6', borderRadius: '14px', borderLeft: '3px solid #C9A96E' }}>
            <p style={{ fontSize: '12px', color: '#9A8F84', lineHeight: 1.7, marginBottom: 0 }}>MPR Studio SpA · RUT 78.402.051-7 · Santiago, Chile · hola@holaclara.app</p>
          </div>
        </div>
      </div>
    </>
  )
}
