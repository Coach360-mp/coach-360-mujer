'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLideresRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard?tab=lideres')
  }, [router])
  return null
}
