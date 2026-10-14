import { useState, useEffect } from 'react'
import { request } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import ConnectCard from './ConnectCard'
import CalendarTab from './CalendarTab'
import DriveTab from './DriveTab'
import TasksTab from './TasksTab'
import SheetsTab from './SheetsTab'
import DocsTab from './DocsTab'
import FormsTab from './FormsTab'
import AdsTab from './AdsTab'

const TABS = [
  { value: 'calendar', label: 'Calendar' },
  { value: 'drive', label: 'Drive' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'sheets', label: 'Sheets' },
  { value: 'docs', label: 'Docs' },
  { value: 'forms', label: 'Forms' },
  { value: 'ads', label: 'Ads' },
]

export default function GooglePage() {
  const [connected, setConnected] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Verifica se voltou do OAuth com erro ou sucesso
    const params = new URLSearchParams(window.location.search)
    if (params.get('connected')) {
      window.history.replaceState({}, '', '/google')
    }

    request('/google/status')
      .then(data => { setConnected(data.connected); setProfile(data.profile) })
      .catch(() => setConnected(false))
  }, [])

  if (connected === null) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrações Google</h1>
        <p className="text-sm text-muted-foreground">Centralize Calendar, Drive, Tasks, Sheets, Docs, Forms e Ads</p>
      </div>

      <ConnectCard
        connected={connected}
        profile={profile}
        onDisconnect={() => { setConnected(false); setProfile(null) }}
      />

      {connected && (
        <Card>
          <CardContent className="p-4">
            <Tabs tabs={TABS}>
              {(active) => {
                switch (active) {
                  case 'calendar': return <CalendarTab />
                  case 'drive': return <DriveTab />
                  case 'tasks': return <TasksTab />
                  case 'sheets': return <SheetsTab />
                  case 'docs': return <DocsTab />
                  case 'forms': return <FormsTab />
                  case 'ads': return <AdsTab />
                  default: return null
                }
              }}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
