import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { HomeKpiGrid } from '../components/home/HomeKpiGrid'
import { HomeProfitCard } from '../components/home/HomeProfitCard'
import { HomeRecentJobs } from '../components/home/HomeRecentJobs'
import { HomeSetupGuide } from '../components/home/HomeSetupGuide'
import { formatHomeProfit, getCurrentMonthStats, getGreeting, getHomeKpiCards } from '../components/home/homeMetrics'
import { useMonthlyStatsQuery, useRecentJobsQuery } from '../hooks/useDashboardQueries'
import { loadTailorSettings } from '../lib/settings'

export default function Home() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const monthlyStatsQuery = useMonthlyStatsQuery()
  const recentJobsQuery = useRecentJobsQuery(3)
  const monthlyStats = useMemo(() => monthlyStatsQuery.data ?? [], [monthlyStatsQuery.data])
  const recentJobs = useMemo(() => recentJobsQuery.data ?? [], [recentJobsQuery.data])
  const homeDataReady = !monthlyStatsQuery.isLoading && !recentJobsQuery.isLoading
  const currentMonth = useMemo(() => getCurrentMonthStats(monthlyStats), [monthlyStats])
  const hasJobs = recentJobs.length > 0 || monthlyStats.some((month) => month.jobs > 0)
  const firstName = settings.profile.fullName.trim().split(/\s+/)[0] || 'Tailor'
  const greeting = getGreeting()
  const kpiCards = useMemo(() => getHomeKpiCards(currentMonth), [currentMonth])
  const homeSubcopy = !homeDataReady
    ? 'Preparing your shop for today.'
    : hasJobs
    ? 'Your workshop activity is ready for today.'
    : 'Start with one job. TailorDeck will organize the client, measurements, and deadline for you.'

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
    <section className="section stack gap-16">
      <div className="stack gap-4">
        <h1 className="home-greeting-title">{greeting}, {firstName}</h1>
        <p className="text-base text-muted">{homeSubcopy}</p>
      </div>

      {homeDataReady && !hasJobs ? <HomeSetupGuide shopName={settings.businessInfo.shopName} /> : null}
      {homeDataReady && hasJobs ? <HomeKpiGrid cards={kpiCards} /> : null}
      {homeDataReady && hasJobs ? <HomeProfitCard profit={formatHomeProfit(currentMonth)} onOpenDashboard={() => navigate('/dashboard')} /> : null}
      {homeDataReady && hasJobs ? <HomeRecentJobs jobs={recentJobs} /> : null}
    </section>
  )
}
