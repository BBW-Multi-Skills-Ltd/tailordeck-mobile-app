import { motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { mockJobs } from '../data/mockJobs'
import { formatDateShort, formatNaira, getInitial } from '../lib/utils'
import type { JobStatus } from '../types/job'

type JobFilter = 'All' | JobStatus

const filters: JobFilter[] = ['All', 'Pending', 'In Progress', 'Completed']

function statusClass(status: JobStatus): string {
  if (status === 'Completed') return 'badge badge-done'
  if (status === 'In Progress') return 'badge badge-progress'
  return 'badge badge-pending'
}

export default function Jobs() {
  const [activeFilter, setActiveFilter] = useState<JobFilter>('All')
  const [search, setSearch] = useState('')

  const filteredJobs = useMemo(() => {
    const byStatus = activeFilter === 'All' ? mockJobs : mockJobs.filter((job) => job.status === activeFilter)
    const term = search.trim().toLowerCase()
    if (!term) return byStatus
    return byStatus.filter((job) => job.clientName.toLowerCase().includes(term))
  }, [activeFilter, search])

  const sortedJobs = useMemo(
    () =>
      [...filteredJobs].sort((a, b) =>
        a.createdDate < b.createdDate ? 1 : -1,
      ),
    [filteredJobs],
  )

  function emptyMessage(filter: JobFilter): string {
    if (filter === 'All') return 'No jobs yet. Start by creating a new job.'
    return `No ${filter.toLowerCase()} jobs yet.`
  }

  return (
    <section className="section stack gap-16">
      <header className="row-between">
        <h1 className="app-page-heading">Jobs</h1>
        <Link to="/jobs/new" className="btn btn-primary btn-sm">
          <Plus size={16} />
          New Job
        </Link>
      </header>

      <div className="pill-group">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`pill${activeFilter === filter ? ' active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <label className="search-bar" aria-label="Search jobs by client name">
        <Search size={17} className="text-muted" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search jobs by client name"
          inputMode="search"
        />
      </label>

      {sortedJobs.length === 0 ? (
        <div className="empty-state card">
          <p className="empty-state-title">Nothing Here Yet</p>
          <p className="empty-state-desc">{emptyMessage(activeFilter)}</p>
        </div>
      ) : (
        <motion.div
          className="stack gap-8"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {sortedJobs.map((job) => (
            <motion.article
              key={job.id}
              className="client-card"
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            >
              <Link to={`/jobs/${job.id}`} className="client-card-link">
                <div className="client-avatar">{getInitial(job.clientName)}</div>

                <div className="client-main">
                  <p className="client-name truncate">{job.clientName}</p>
                  <p className="text-sm text-muted truncate">
                    {job.title} - {job.jobType}
                  </p>
                  <div className="recent-job-meta-row">
                    <p className="recent-job-meta-text">Due: {formatDateShort(job.deadlineDate)}</p>
                    <p className="recent-job-meta-text recent-job-meta-right">Charge {formatNaira(job.chargeAmount)}</p>
                  </div>
                </div>

                <span className={statusClass(job.status)}>{job.status}</span>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      )}
    </section>
  )
}

