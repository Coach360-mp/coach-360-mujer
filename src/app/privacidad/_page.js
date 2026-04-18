'use client'
export default function Privacidad() {
  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', fontFamily: 'Georgia, serif', color: '#1a1a1a', padding: '60px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: '#d4af37', textTransform: 'uppercase', fontWeight: 600, marginBottom: 16, fontFamily: 'system-ui' }}>Coach 360</div>
        <h1 style={{ fontSize: 36, fontWeight: 300, marginBottom: 8 }}>Política de Privacidad y Tratamiento de Datos</h1>
        <p style={{ fontSize: 13, color: '#888', fontFamily: 'system-ui', marginBottom: 48 }}>Última actualización: abril 2025 — Vigente bajo Ley N° 19.628 (Chile)</p>

        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 12, marginTop: 40 }}>1. Responsable del tratamiento</h2>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333', marginBottom: 16 }}>Coach 360, plataforma operada por María Paz Reveco (en adelante "Coach 360", "nosotros" o "la plataforma"), con domicilio en Chile, es responsable del tratamiento de los datos personales que usted proporciona al usar nuestros servicios.</p>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>Contacto: privacidad@micoach360.com</p>

        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 12, marginTop: 40 }}>2. Datos que recopilamos</h2>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333', marginBottom: 12 }}>Recopilamos los siguientes datos personales:</p>
        <ul style={{ fontSize: 15, lineHeight: 2, color: '#333', paddingLeft: 24 }}>
          <li><strong>Datos de identificación:</strong> nombre, dirección de correo electrónico.</li>
          <li><strong>Datos de estado emocional y bienestar:</strong> registros diarios de ánimo, energía y claridad mental (check-ins).</li>
          <li><strong>Datos psicológicos y de autoconocimiento:</strong> respuestas a tests de personalidad, tipología ontológica y estilos de liderazgo.</li>
          <li><strong>Datos sobre momentos de vida:</strong> situaciones personales, focos de desarrollo y respuestas libres sobre metas personales.</li>
          <li><strong>Datos de uso:</strong> hábitos configurados, progreso en módulos, mensajes enviados al coach IA.</li>
          <li><strong>Datos de pago:</strong> procesados por Mercado Pago. Coach 360 no almacena datos de tarjetas.</li>
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 12, marginTop: 40 }}>3. Datos sensibles y consentimiento explícito</h2>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>De conformidad con el artículo 2° letra g) y el artículo 10° de la Ley N° 19.628, los datos relativos al estado emocional, bienestar psicológico y características de personalidad constituyen <strong>datos sensibles</strong>. Su tratamiento requiere consentimiento explícito e informado, el cual usted otorga al aceptar esta política durante el proceso de registro. Usted puede revocar este consentimiento en cualquier momento escribiendo a privacidad@micoach360.com, lo que implicará la eliminación de su cuenta y datos asociados.</p>

        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 12, marginTop: 40 }}>4. Finalidad del tratamiento</h2>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333', marginBottom: 12 }}>Sus datos se utilizan exclusivamente para:</p>
        <ul style={{ fontSize: 15, lineHeight: 2, color: '#333', paddingLeft: 24 }}>
          <li>Personalizar la experiencia de coaching con el coach IA asignado.</li>
          <li>Generar contexto de memoria para que el coach recuerde información relevante entre sesiones.</li>
          <li>Calcular estadísticas de progreso personal (racha, puntos, bienestar).</li>
          <li>Enviar comunicaciones relacionadas con el servicio (emails del coach, notificaciones de racha).</li>
          <li>Mejorar los modelos y la experiencia de la plataforma de forma anonimizada.</li>
        </ul>

        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 12, marginTop: 40 }}>5. Base legal del tratamiento</h2>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>El tratamiento de sus datos se basa en: (a) su consentimiento explícito otorgado al momento del registro; (b) la ejecución del contrato de servicio entre usted y Coach 360; y (c) el interés legítimo en la mejora del servicio, siempre de forma anonimizada.</p>

        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 12, marginTop: 40 }}>6. Compartición de datos con terceros</h2>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333', marginBottom: 12 }}>Sus datos pueden ser procesados por los siguientes proveedores, únicamente en la medida necesaria para prestar el servicio:</p>
        <ul style={{ fontSize: 15, lineHeight: 2, color: '#333', paddingLeft: 24 }}>
          <li><strong>Anthropic (Claude API):</strong> procesamiento de mensajes de chat para generar respuestas del coach IA. Los mensajes se transmiten de forma segura y no se usan para entrenar modelos sin consentimiento.</li>
          <li><strong>Supabase:</strong> almacenamiento de datos en servidores ubicados en São Paulo, Brasil.</li>
          <li><strong>Vercel:</strong> infraestructura de la aplicación web.</li>
          <li><strong>Resend:</strong> envío de emails transaccionales.</li>
          <li><strong>Mercado Pago:</strong> procesamiento de pagos.</li>
        </ul>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>Coach 360 no vende ni comparte sus datos personales con terceros para fines publicitarios.</p>

        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 12, marginTop: 40 }}>7. Derechos del titular (ARCO)</h2>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333', marginBottom: 12 }}>De conformidad con la Ley N° 19.628, usted tiene derecho a:</p>
        <ul style={{ fontSize: 15, lineHeight: 2, color: '#333', paddingLeft: 24 }}>
          <li><strong>Acceso:</strong> solicitar una copia de sus datos personales.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
          <li><strong>Cancelación:</strong> solicitar la eliminación de sus datos.</li>
          <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos para determinadas finalidades.</li>
        </ul>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>Para ejercer estos derechos, escríbanos a privacidad@micoach360.com. Responderemos en un plazo máximo de 15 días hábiles.</p>

        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 12, marginTop: 40 }}>8. Seguridad</h2>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>Implementamos medidas técnicas y organizativas para proteger sus datos: cifrado en tránsito (HTTPS/TLS), autenticación segura, control de acceso por roles (RLS en base de datos) y acceso restringido a datos sensibles.</p>

        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 12, marginTop: 40 }}>9. Conservación de datos</h2>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>Sus datos se conservan mientras mantenga una cuenta activa en Coach 360. Al eliminar su cuenta, sus datos personales identificables serán eliminados en un plazo de 30 días, conservando únicamente datos anonimizados para fines estadísticos.</p>

        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 12, marginTop: 40 }}>10. Cookies</h2>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>Utilizamos cookies técnicas esenciales para el funcionamiento de la autenticación. No utilizamos cookies de seguimiento ni publicidad.</p>

        <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 12, marginTop: 40 }}>11. Modificaciones</h2>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>Podemos actualizar esta política. Le notificaremos por email ante cambios sustanciales. El uso continuado del servicio tras la notificación implica aceptación.</p>

        <div style={{ borderTop: '1px solid #e8e0d6', marginTop: 60, paddingTop: 24, fontSize: 13, color: '#888', fontFamily: 'system-ui' }}>
          <p>Coach 360 — María Paz Reveco — privacidad@micoach360.com — micoach360.com</p>
        </div>
      </div>
    </div>
  )
}