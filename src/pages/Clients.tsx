import { motion } from 'framer-motion'
import { ChevronRight, Phone, Search, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import EmptyState from '../components/shared/EmptyState'
import { useClientsListQuery } from '../hooks/useClientQueries'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { formatDateShort, getInitial } from '../lib/utils'

export default function Clients() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  // Server-side search and paging: every client can be found, not only the first page.
  const clientsQuery = useClientsListQuery(debouncedSearch)
  const filteredClients = useMemo(() => clientsQuery.data?.pages.flatMap((page) => page.items) ?? [], [clientsQuery.data])
  const searching = Boolean(debouncedSearch.trim())

  return (
    <section className="section stack gap-16">
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
          title={searching ? 'No clients found' : 'No clients yet'}
          description={
            searching
              ? 'No client matches that search. Try another name.'
              : 'Clients appear automatically after you create jobs. Tap the center plus button to add your first client and measurements.'
          }
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
          {clientsQuery.hasNextPage ? (
            <button
              type="button"
              className="btn btn-secondary btn-full"
              disabled={clientsQuery.isFetchingNextPage}
              onClick={() => void clientsQuery.fetchNextPage()}
            >
              {clientsQuery.isFetchingNextPage ? 'Loading...' : 'Load more clients'}
            </button>
          ) : null}
        </motion.div>
      )}
    </section>
  )
}
