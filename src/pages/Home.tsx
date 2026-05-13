import { motion } from 'framer-motion'
import { RiScissorsLine } from 'react-icons/ri'
import { TbCurrencyNaira, TbMoneybag } from 'react-icons/tb'
import { HiOutlineArrowTrendingUp } from 'react-icons/hi2'
import { FiPlus } from 'react-icons/fi'
import { Link } from 'react-router-dom'

type JobStatus = 'Pending' | 'In Progress' | 'Completed'

type RecentJob = {
  id: string
  title: string
  dueText: string
  status: JobStatus
}

const recentJobs: RecentJob[] = [
  { id: '1', title: 'Agbada for Mr. Ade', dueText: 'Due: Oct 24', status: 'Pending' },
  { id: '2', title: 'Wedding Lace - Chioma', dueText: 'Due: Oct 20', status: 'In Progress' },
  { id: '3', title: 'Senator Suit (Navy)', dueText: 'Delivered today', status: 'Completed' },
]

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
  return (
    <section className="section stack gap-16">
      <div className="stack gap-4">
        <h1>Good morning, Favour</h1>
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
      >
        <p className="home-profit-label">Total Profit</p>
        <div className="home-profit-row">
          <p className="home-profit-value">{'\u20A6850,000'}</p>
          <HiOutlineArrowTrendingUp size={38} className="home-profit-trend" />
        </div>
      </motion.article>

      <div className="stack gap-12">
        <div className="row-between">
          <h2>Recent Jobs</h2>
          <Link to="/jobs" className="home-link">
            View All
          </Link>
        </div>

        <div className="stack gap-8">
          {recentJobs.map((job) => (
            <article key={job.id} className="recent-job-card card-pressable">
              <div className="recent-job-icon center">
                <TbCurrencyNaira size={18} />
              </div>
              <div className="stack min-w-0 flex-1">
                <p className="font-semibold truncate">{job.title}</p>
                <p className="text-sm text-muted">{job.dueText}</p>
              </div>
              <span className={statusClass(job.status)}>{job.status}</span>
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
