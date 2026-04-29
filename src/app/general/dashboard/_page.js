'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardGeneralRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard?tab=coach360')
  }, [router])
  return null
}
