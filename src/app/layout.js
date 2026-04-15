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
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Coach 360" />
      </head>
      <body>{children}</body>
    </html>
  )
}
