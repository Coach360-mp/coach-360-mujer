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

      // Rutas legacy eliminadas → landing universal
      { source: '/general',            destination: '/',           permanent: true },
      { source: '/general/onboarding', destination: '/onboarding', permanent: true },
      { source: '/lideres',            destination: '/',           permanent: true },
      { source: '/equipos',            destination: '/',           permanent: true },

      // /líderes con tilde → /lideres (el subroute /onboarding sigue activo)
      { source: '/líderes/:path*', destination: '/lideres/:path*', permanent: true },
    ]
  },
}

module.exports = nextConfig
