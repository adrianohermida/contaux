import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Megaphone, FileEdit, Award } from 'lucide-react'

const subTabs = [
  { to: '/marketing', label: 'Campanhas', icon: Megaphone, end: true },
  { to: '/marketing/blog', label: 'Blog', icon: FileEdit, end: false },
  { to: '/marketing/fidelidade', label: 'Fidelidade', icon: Award, end: false },
]

export default function MarketingPage({ view }) {
  return (
    <div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {subTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )
            }
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </NavLink>
        ))}
      </div>

      {view === 'blog' ? <BlogView /> : view === 'loyalty' ? <LoyaltyView /> : <CampaignsView />}
    </div>
  )
}

import CampanhasPage from './CampanhasPage'
import BlogPage from './BlogPage'
import FidelidadePage from './FidelidadePage'

function CampaignsView() { return <CampanhasPage /> }
function BlogView() { return <BlogPage /> }
function LoyaltyView() { return <FidelidadePage /> }
