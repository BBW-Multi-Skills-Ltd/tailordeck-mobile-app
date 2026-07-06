import { motion } from 'framer-motion'
import { ChevronRight, Phone, Search, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import EmptyState from '../components/shared/EmptyState'
import { useClientsQuery } from '../hooks/useClientQueries'
import { formatDateShort, getInitial } from '../lib/utils'

export default function Clients() {
  const clientsQuery = useClientsQuery()
  const clients = clientsQuery.data ?? []
  const [search, setSearch] = useState('')

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return clients
    return clients.filter((client) => client.name.toLowerCase().includes(term))
  }, [clients, search])

  return (
    <section className="section stack gap-16">
      <header className="row-between">
        <h1 className="app-page-heading">Clients</h1>
      </header>

      <label className="search-bar" aria-label="Search clients by name">
        <Search size={17} className="text-muted" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search clients by name"
          inputMode="search"
        />
      </label>

      {clientsQuery.isLoading ? (
        <div className="stack gap-8">
          <div className="skeleton" style={{ height: 86 }} />
          <div className="skeleton" style={{ height: 86 }} />
          <div className="skeleton" style={{ height: 86 }} />
        </div>
      ) : clientsQuery.isError ? (
        <EmptyState
          icon={Users}
          title="Unable to load clients"
          description="Check your connection and Supabase access policies, then refresh the page."
        />
      ) : filteredClients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={clients.length === 0 ? 'No clients yet' : 'No clients found'}
          description={
            clients.length === 0
              ? 'Clients will appear here after you create jobs. Start from New Job to store client details and measurements.'
              : 'No client matches that search. Try another name.'
          }
          actionLabel={clients.length === 0 ? 'Create Job' : undefined}
          actionTo={clients.length === 0 ? '/jobs/new' : undefined}
        />
      ) : (
        <motion.div
          className="stack gap-8"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {filteredClients.map((client) => (
            <motion.article
              key={client.id}
              className="client-card"
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            >
              <Link to={`/clients/${client.id}`} className="client-card-link">
                <div className="client-avatar">{getInitial(client.name)}</div>

                <div className="client-main">
                  <p className="client-name truncate">{client.name}</p>

                  <div className="client-phone-row">
                    <Phone size={15} />
                    <span>{client.phone}</span>
                  </div>

                  <p className="client-last-job">Last job: {formatDateShort(client.last_job_date)}</p>
                </div>

                <div className="client-arrow">
                  <ChevronRight size={22} />
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      )}
    </section>
  )
}
