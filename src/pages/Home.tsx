import { motion } from 'framer-motion'
import { Scissors } from 'lucide-react'
import { RiScissorsLine } from 'react-icons/ri'
import { TbMoneybag } from 'react-icons/tb'
import { HiOutlineArrowTrendingUp } from 'react-icons/hi2'
import { FiPlus } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../components/shared/EmptyState'
import { appJobs } from '../data/appData'
import { loadTailorSettings } from '../lib/settings'
import { formatDueDate, getInitial } from '../lib/utils'
import type { JobStatus } from '../types/job'

type RecentJob = {
  id: string
  clientName: string
  title: string
  deadlineDate: string
  status: JobStatus
}

const recentJobs: RecentJob[] = [...appJobs]
  .sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1))
  .slice(0, 3)
  .map((job) => ({
    id: job.id,
    clientName: job.clientName,
    title: job.title,
    deadlineDate: job.deadlineDate,
    status: job.status,
  }))

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatCompactNaira(value: number): string {
  return `\u20A6${value.toLocaleString('en-NG')}`
}

function formatHomeProfit(): string {
  const profit = appJobs.reduce((sum, job) => {
    const ratio = job.status === 'Completed' ? 0.36 : job.status === 'In Progress' ? 0.32 : 0.28
    return sum + (job.chargeAmount - Math.round(job.chargeAmount * ratio))
  }, 0)

  return formatCompactNaira(profit)
}

function statusClass(status: JobStatus): string {
  if (status === 'Completed') return 'badge badge-done'
  if (status === 'In Progress') return 'badge badge-progress'
  return 'badge badge-pending'
}

export default function Home() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(() => loadTailorSettings())
  const hasJobs = appJobs.length > 0
  const firstName = settings.profile.fullName.trim().split(/\s+/)[0] || 'Tailor'
  const greeting = getGreeting()
  const kpiCards = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthJobs = appJobs.filter((job) => job.createdDate.slice(0, 7) === currentMonth)
    const totalExpenses = monthJobs.reduce((sum, job) => {
      const ratio = job.status === 'Completed' ? 0.36 : job.status === 'In Progress' ? 0.32 : 0.28
      return sum + Math.round(job.chargeAmount * ratio)
    }, 0)

    return [
      { label: 'Jobs This Month', value: String(monthJobs.length), icon: RiScissorsLine },
      { label: 'Total Expenses', value: `\u20A6${Math.round(totalExpenses / 1000)}k`, icon: TbMoneybag },
    ]
  }, [])

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

      {hasJobs ? (
        <motion.div
          className="kpi-grid"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {kpiCards.map((card) => {
            const Icon = card.icon
            return (
              <motion.article
                key={card.label}
                className="stat-card card-3d"
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                <Icon size={20} className="text-primary" />
                <p className="stat-label mt-8">{card.label}</p>
                <p className="stat-value">{card.value}</p>
              </motion.article>
            )
          })}
        </motion.div>
      ) : null}

      {hasJobs ? (
        <motion.article
          className="home-profit-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          role="button"
          tabIndex={0}
          onClick={() => navigate('/dashboard')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              navigate('/dashboard')
            }
          }}
        >
          <p className="home-profit-label">Total Profit</p>
          <div className="home-profit-row">
            <p className="home-profit-value">{formatHomeProfit()}</p>
            <HiOutlineArrowTrendingUp size={28} className="home-profit-trend" />
          </div>
        </motion.article>
      ) : null}

      <div className="stack gap-12">
        <div className="row-between">
          <h2 className="home-section-title">Recent Jobs</h2>
          <Link to="/jobs" className="home-link">
            View All
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="No jobs yet"
            description="Create your first tailoring job to start tracking clients, measurements, deadlines, and profit."
            actionLabel="Create Job"
            actionTo="/jobs/new"
          />
        ) : (
          <div className="stack gap-8">
            {recentJobs.map((job) => (
              <article key={job.id} className="recent-job-card card-pressable">
                <div className="recent-job-icon center">
                  <span className="recent-job-initial">{getInitial(job.clientName)}</span>
                </div>
                <div className="stack min-w-0 flex-1 recent-job-main">
                  <p className="recent-job-title truncate">{job.title}</p>
                  <div className="recent-job-meta-row">
                    <p className="recent-job-meta-text">{formatDueDate(job.deadlineDate)}</p>
                  </div>
                </div>
                <span className={`${statusClass(job.status)} recent-job-status`}>{job.status}</span>
              </article>
            ))}
          </div>
        )}
      </div>

      <Link to="/jobs/new" className="fab" aria-label="Create new job">
        <FiPlus size={26} className="fab-icon" />
      </Link>
    </section>
  )
}
