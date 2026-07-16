import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ClientJobHistory from '../components/clientprofile/ClientJobHistory'
import ClientMeasurementsSection from '../components/clientprofile/ClientMeasurementsSection'
import ClientProfileCard from '../components/clientprofile/ClientProfileCard'
import { useClientMeasurements } from '../components/clientprofile/useClientMeasurements'
import EmptyState from '../components/shared/EmptyState'
import PageHeader from '../components/shared/PageHeader'
import { useClientQuery, useSoftDeleteClientMutation } from '../hooks/useClientQueries'
import { useClientJobsQuery } from '../hooks/useJobQueries'
import { mapJobRow } from '../services/mappers/jobMapper'

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const clientQuery = useClientQuery(id)
  const client = clientQuery.data
  const clientJobsQuery = useClientJobsQuery(client?.id)
  const clientJobs = clientJobsQuery.data ?? []
  const deleteClientMutation = useSoftDeleteClientMutation()
  const measurements = useClientMeasurements(clientJobs)

  const completedJobs = useMemo(
    () => clientJobs.filter((job) => job.status === 'completed').map(mapJobRow),
    [clientJobs],
  )
  const measurementJobs = useMemo(() => clientJobs.map(mapJobRow), [clientJobs])

  if (clientQuery.isLoading || clientJobsQuery.isLoading) {
    return (
      <section className="section stack gap-16">
        <div className="skeleton" style={{ height: 42 }} />
        <div className="skeleton" style={{ height: 96 }} />
        <div className="skeleton" style={{ height: 180 }} />
      </section>
    )
  }

  if (!client) {
    return (
      <section className="section stack gap-16">
        <h2 className="app-page-heading">Client Not Found</h2>
        <p className="text-muted">This client may have been deleted or is unavailable.</p>
        <Link to="/clients" className="btn btn-secondary">
          Back to Clients
        </Link>
      </section>
    )
  }

  async function handleDeleteClient(): Promise<void> {
    if (!client) return
    const confirmed = window.confirm(`Delete ${client.name}? This will remove this client profile. This action cannot be undone.`)
    if (!confirmed) return

    try {
      await deleteClientMutation.mutateAsync(client.id)
      navigate('/clients')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to delete client.')
    }
  }

  return (
    <section className="section stack gap-16 page-fab-clearance">
      <PageHeader
        title="Client Profile"
        centered
        leading={(
          <Link to="/clients" className="btn btn-ghost btn-icon" aria-label="Back to clients">
            <ArrowLeft size={18} />
          </Link>
        )}
      />

      <ClientProfileCard client={client} />

      {clientJobsQuery.isError ? (
        <EmptyState title="Unable to load client jobs" description="Check Supabase policies for jobs and job persons, then refresh." />
      ) : null}

      <ClientMeasurementsSection
        isEditing={measurements.isEditing}
        measurementDrafts={measurements.measurementDrafts}
        measurementJobs={measurementJobs}
        onToggleEdit={measurements.toggleEdit}
        onUpdateBodyMeasurement={measurements.updateBodyMeasurement}
        onUpdateNonBodyMeasurement={measurements.updateNonBodyMeasurement}
      />

      <ClientJobHistory jobs={completedJobs} />

      <article className="client-repeat-card card">
        <div className="client-repeat-icon">
          <RotateCcw size={18} />
        </div>
        <div className="stack gap-4 min-w-0">
          <h4>Create another job</h4>
          <p>Use {client.name}'s saved details and adjust measurements only if this job needs changes.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm client-repeat-btn" onClick={() => navigate(`/jobs/new?clientId=${client.id}`)}>
          Start
        </button>
      </article>

      <button type="button" className="btn btn-danger btn-full" onClick={() => void handleDeleteClient()} disabled={deleteClientMutation.isPending}>
        <Trash2 size={16} />
        {deleteClientMutation.isPending ? 'Deleting...' : 'Delete Client'}
      </button>
    </section>
  )
}
