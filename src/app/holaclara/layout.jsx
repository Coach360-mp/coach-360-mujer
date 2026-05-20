export const metadata = {
  title: 'Hola Clara',
  description: 'Tu espacio de bienestar personal. Sin agendar, sin culpa, en español.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Clara' },
}
export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, themeColor: '#2A2520' }
export default function HolaClaraLayout({ children }) {
  return (<>
    <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))}` }} />
    {children}
  </>)
}