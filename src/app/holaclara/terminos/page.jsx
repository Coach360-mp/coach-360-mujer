'use client'
import { useRouter } from 'next/navigation'

export default function TerminosPage() {
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
          <h1 style={s.h1}>Términos de Uso</h1>
          <p style={s.small}>Última actualización: mayo 2026</p>

          <p style={s.p}>Al usar Hola Clara, aceptas estos términos. Por favor léelos con atención.</p>

          <h2 style={s.h2}>1. Qué es Hola Clara</h2>
          <p style={s.p}>Hola Clara es una aplicación de acompañamiento personal desarrollada por MPR Studio SpA (RUT 78.402.051-7), con domicilio en Chile. Clara es una inteligencia artificial diseñada para apoyar el autoconocimiento y bienestar emocional de mujeres. No es un servicio de salud mental, psicología ni medicina.</p>

          <h2 style={s.h2}>2. Qué no somos</h2>
          <p style={s.p}>Clara no es terapeuta, psicóloga ni médico. El contenido de Hola Clara tiene propósito de bienestar personal y no reemplaza atención profesional de salud mental. Si estás en crisis o necesitas ayuda urgente, por favor contacta a un profesional de salud o llama a una línea de crisis.</p>

          <h2 style={s.h2}>3. Tu cuenta</h2>
          <p style={s.p}>Eres responsable de mantener la confidencialidad de tu cuenta. Solo puedes usar Hola Clara si tienes 18 años o más. Al registrarte, declaras que la información que proporcionas es verídica.</p>

          <h2 style={s.h2}>4. Planes y pagos</h2>
          <p style={s.p}>Hola Clara ofrece un plan gratuito y planes de pago. Los pagos se procesan a través de Mercado Pago. Los precios están en pesos chilenos (CLP) e incluyen impuestos cuando corresponde.</p>
          <p style={s.p}>Ofrecemos una garantía de 7 días desde la fecha de pago. Si no estás satisfecha, escríbenos a hola@holaclara.app y te devolvemos el valor íntegro sin preguntas.</p>

          <h2 style={s.h2}>5. Propiedad intelectual</h2>
          <p style={s.p}>Todo el contenido de Hola Clara — incluyendo textos, diseño, metodología y marca — es propiedad de MPR Studio SpA. No puedes reproducirlo, modificarlo ni distribuirlo sin autorización escrita.</p>

          <h2 style={s.h2}>6. Limitación de responsabilidad</h2>
          <p style={s.p}>MPR Studio SpA no se hace responsable por decisiones tomadas en base al contenido de Hola Clara. La aplicación se ofrece "tal cual" y podemos modificar o interrumpir el servicio con aviso previo razonable.</p>

          <h2 style={s.h2}>7. Ley aplicable</h2>
          <p style={s.p}>Estos términos se rigen por las leyes de la República de Chile. Cualquier disputa se someterá a los tribunales ordinarios de justicia de Santiago de Chile.</p>

          <h2 style={s.h2}>8. Contacto</h2>
          <p style={s.p}>Para cualquier consulta sobre estos términos, escríbenos a <a href="mailto:hola@holaclara.app" style={{ color: '#C9A96E' }}>hola@holaclara.app</a>.</p>

          <div style={{ marginTop: '48px', padding: '20px', background: '#F5EFE6', borderRadius: '14px', borderLeft: '3px solid #C9A96E' }}>
            <p style={{ ...s.small, marginBottom: 0 }}>MPR Studio SpA · RUT 78.402.051-7 · Santiago, Chile · hola@holaclara.app</p>
          </div>
        </div>
      </div>
    </>
  )
}
