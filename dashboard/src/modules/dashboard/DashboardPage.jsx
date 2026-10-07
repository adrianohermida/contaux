import DashboardStats from './DashboardStats'
import DashboardActivity from './DashboardActivity'
import DashboardAlerts from './DashboardAlerts'
import DashboardShortcuts from './DashboardShortcuts'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardStats />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardActivity />
        </div>
        <div className="space-y-6">
          <DashboardAlerts />
          <DashboardShortcuts />
        </div>
      </div>
    </div>
  )
}
