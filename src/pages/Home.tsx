import { motion } from 'framer-motion'
import { RiScissorsLine } from 'react-icons/ri'
import { TbMoneybag } from 'react-icons/tb'
import { HiOutlineArrowTrendingUp } from 'react-icons/hi2'
import { FiPlus } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { mockJobs } from '../data/mockJobs'
import { formatDueDate, getInitial } from '../lib/utils'
import type { JobStatus } from '../types/job'

type RecentJob = {
  id: string
  clientName: string
  title: string
  deadlineDate: string
  status: JobStatus
}

const recentJobs: RecentJob[] = [...mockJobs]
  .sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1))
  .slice(0, 3)
  .map((job) => ({
    id: job.id,
    clientName: job.clientName,
    title: job.title,
    deadlineDate: job.deadlineDate,
    status: job.status,
  }))

const kpiCards = [
  { label: 'Jobs This Month', value: '24', icon: RiScissorsLine },
  { label: 'Total Expenses', value: '\u20A6142k', icon: TbMoneybag },
]

function statusClass(status: JobStatus): string {
  if (status === 'Completed') return 'badge badge-done'
  if (status === 'In Progress') return 'badge badge-progress'
  return 'badge badge-pending'
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <section className="section stack gap-16 page-fab-clearance">
      <div className="stack gap-4">
        <h1 className="home-greeting-title">Good morning, Favour</h1>
        <p className="text-base text-muted">Your workshop is busy today.</p>
      </div>

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
          <p className="home-profit-value">{'\u20A6850,000'}</p>
          <HiOutlineArrowTrendingUp size={28} className="home-profit-trend" />
        </div>
      </motion.article>

      <div className="stack gap-12">
        <div className="row-between">
          <h2 className="home-section-title">Recent Jobs</h2>
          <Link to="/jobs" className="home-link">
            View All
          </Link>
        </div>

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
      </div>

      <Link to="/jobs/new" className="fab" aria-label="Create new job">
        <FiPlus size={26} className="fab-icon" />
      </Link>
    </section>
  )
}
