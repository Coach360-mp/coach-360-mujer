import './globals.css'

export const metadata = {
  title: 'Coach 360 Mujer',
  description: 'Más claridad. Más poder. Más tú.',
  manifest: '/manifest.json',
  themeColor: '#1a1a1a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
