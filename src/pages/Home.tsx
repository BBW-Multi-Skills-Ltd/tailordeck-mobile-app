import { FiPlus } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { HomeKpiGrid } from '../components/home/HomeKpiGrid'
import { HomeProfitCard } from '../components/home/HomeProfitCard'
import { HomeRecentJobs } from '../components/home/HomeRecentJobs'
import { formatHomeProfit, getGreeting, getHomeKpiCards, getRecentJobs } from '../components/home/homeMetrics'
import { appJobs } from '../data/appData'
import { loadTailorSettings } from '../lib/settings'

export default function Home() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const hasJobs = appJobs.length > 0
  const firstName = settings.profile.fullName.trim().split(/\s+/)[0] || 'Tailor'
  const greeting = getGreeting()
  const kpiCards = useMemo(() => getHomeKpiCards(), [])
  const recentJobs = useMemo(() => getRecentJobs(), [])

  useEffect(() => {
    function syncSettings() {
      setSettings(loadTailorSettings())
    }

    window.addEventListener('storage', syncSettings)
    window.addEventListener('tailordeck-settings-updated', syncSettings)
    return () => {
      window.removeEventListener('storage', syncSettings)
      window.removeEventListener('tailordeck-settings-updated', syncSettings)
    }
  }, [])

  return (
    <section className="section stack gap-16 page-fab-clearance">
      <div className="stack gap-4">
        <h1 className="home-greeting-title">{greeting}, {firstName}</h1>
        <p className="text-base text-muted">Your workshop is busy today.</p>
      </div>

      {hasJobs ? <HomeKpiGrid cards={kpiCards} /> : null}
      {hasJobs ? <HomeProfitCard profit={formatHomeProfit()} onOpenDashboard={() => navigate('/dashboard')} /> : null}
      <HomeRecentJobs jobs={recentJobs} />

      <Link to="/jobs/new" className="fab" aria-label="Create new job">
        <FiPlus size={26} className="fab-icon" />
      </Link>
    </section>
  )
}
