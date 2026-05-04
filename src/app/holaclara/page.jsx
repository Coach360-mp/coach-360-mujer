export default function HolaClaraLanding() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#FAFAF7',
      fontFamily: 'Jost, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <p style={{fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',color:'#C9A96E'}}>
        Hola Clara — en construcción
      </p>
      <h1 style={{fontFamily:'Georgia,serif',fontStyle:'italic',fontSize:'32px',fontWeight:300,color:'#2A2520',textAlign:'center',maxWidth:'400px',lineHeight:1.3}}>
        Para la que quiere más y necesita parar.
      </h1>
      <a href="/holaclara/test" style={{marginTop:'8px',padding:'12px 28px',background:'#2A2520',color:'#FAFAF7',borderRadius:'10px',textDecoration:'none',fontSize:'13px'}}>
        Hacer el test →
      </a>
    </main>
  )
}
