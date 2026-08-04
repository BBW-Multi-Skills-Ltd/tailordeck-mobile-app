import { motion } from 'framer-motion'
import { Search, Scissors } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/shared/EmptyState'
import SegmentedControl from '../components/shared/SegmentedControl'
import { useJobsQuery } from '../hooks/useJobQueries'
import { formatDateShort, formatNaira, getInitial } from '../lib/utils'
import type { JobStatus } from '../types/job'

type JobFilter = 'All' | 'Draft' | 'In Progress' | 'Completed'

const filters: JobFilter[] = ['All', 'Draft', 'In Progress', 'Completed']

function statusClass(status: JobStatus): string {
  if (status === 'Completed') return 'badge badge-done'
  if (status === 'In Progress') return 'badge badge-progress'
  return 'badge badge-pending'
}

export default function Jobs() {
  const [activeFilter, setActiveFilter] = useState<JobFilter>('All')
  const [search, setSearch] = useState('')
  const jobsQuery = useJobsQuery(activeFilter === 'All' ? undefined : activeFilter)
  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data])

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return jobs
    return jobs.filter((job) => job.clientName.toLowerCase().includes(term))
  }, [jobs, search])

  const sortedJobs = useMemo(
    () =>
      [...filteredJobs].sort((a, b) =>
        a.createdDate < b.createdDate ? 1 : -1,
      ),
    [filteredJobs],
  )

  function emptyMessage(filter: JobFilter): string {
    if (search.trim()) return `No ${filter === 'All' ? 'jobs' : filter.toLowerCase()} match that search.`
    if (filter === 'Draft') return 'No draft jobs yet. Saved drafts will appear here.'
    if (filter === 'In Progress') return 'No jobs in progress yet. Finalized jobs you are working on will appear here.'
    if (filter === 'Completed') return 'No completed jobs yet. Jobs you mark as completed will appear here.'
    return 'Tap the center plus button to create your first job with client details, measurements, pricing, and deadline.'
  }

  function emptyTitle(filter: JobFilter): string {
    if (search.trim()) return 'Nothing found'
    if (filter === 'Draft') return 'No drafts yet'
    if (filter === 'In Progress') return 'No jobs in progress'
    if (filter === 'Completed') return 'No completed jobs yet'
    return 'No jobs yet'
  }

  return (
    <section className="section stack gap-16">
      <SegmentedControl label="Filter jobs" options={filters} value={activeFilter} onChange={setActiveFilter} />

      <label className="search-bar" aria-label="Search jobs by client name">
        <Search size={17} className="text-muted" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search jobs by client name"
          inputMode="search"
        />
      </label>

      {jobsQuery.isLoading ? (
        <div className="stack gap-8">
          <div className="skeleton" style={{ height: 86 }} />
          <div className="skeleton" style={{ height: 86 }} />
          <div className="skeleton" style={{ height: 86 }} />
        </div>
      ) : jobsQuery.isError ? (
        <EmptyState
          icon={Scissors}
          title="Unable to load jobs"
          description="Check your connection and Supabase policies for jobs, then refresh the page."
        />
      ) : sortedJobs.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title={emptyTitle(activeFilter)}
          description={emptyMessage(activeFilter)}
        />
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

