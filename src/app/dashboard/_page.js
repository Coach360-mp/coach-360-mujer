'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CoachDashboard from '@/components/dashboard/CoachDashboard'
import TabBar from '@/components/dashboard/TabBar'
import { useVerticalAccess } from '@/lib/hooks/useVerticalAccess'
import { verticalUItoBD } from '@/lib/constants'

const TABS_DEF = [
  { id: 'coach360', label: 'Coach 360', dataV: 'leo'   },
  { id: 'mujer',    label: 'Mujer',     dataV: 'clara' },
  { id: 'lideres',  label: 'Líderes',   dataV: 'marco' },
]

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab') || 'coach360'
  const [tab, setTab] = useState(tabFromUrl)
  const { coach360, mujer, lideres, loading } = useVerticalAccess()

  // Sync url ↔ state
  useEffect(() => {
    if (tabFromUrl !== tab) setTab(tabFromUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl])

  const access = { coach360, mujer, lideres }
  const tabsVisibles = TABS_DEF
    .filter((t) => access[t.id]?.visible)
    .map((t) => ({ ...t, preview: access[t.id]?.preview }))

  // Si el tab actual no es accesible/visible (ej: hombre llega con ?tab=mujer), redirigir a coach360
  useEffect(() => {
    if (loading) return
    const tabActual = access[tab]
    if (!tabActual?.visible) {
      cambiarTab('coach360')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, tab])

  const cambiarTab = (nuevo) => {
    setTab(nuevo)
    const sp = new URLSearchParams(searchParams.toString())
    sp.set('tab', nuevo)
    router.replace(`/dashboard?${sp.toString()}`, { scroll: false })
  }

  return (
    <div>
      {tabsVisibles.length > 1 && (
        <TabBar tabs={tabsVisibles} active={tab} onChange={cambiarTab} />
      )}
      <CoachDashboard key={tab} vertical={verticalUItoBD(tab)} />
    </div>
  )
}
