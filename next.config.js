/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@supabase/supabase-js', 'resend', 'google-auth-library'],
  experimental: {
    turbo: false,
  },
  async redirects() {
    return [
      // Rutas viejas de dashboard → dashboard único con tab
      { source: '/general/dashboard', destination: '/dashboard?tab=coach360', permanent: true },
      { source: '/lideres/dashboard', destination: '/dashboard?tab=lideres', permanent: true },
      // /líderes con tilde → /lideres
      { source: '/líderes/:path*', destination: '/lideres/:path*', permanent: true },
    ]
  },
}

module.exports = nextConfig
