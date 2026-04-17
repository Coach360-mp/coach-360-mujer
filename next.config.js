/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@supabase/supabase-js', 'resend', 'google-auth-library'],
  experimental: {
    turbo: false,
  },
}

module.exports = nextConfig
