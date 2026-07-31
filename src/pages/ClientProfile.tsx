import { RotateCcw, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ClientJobHistory from '../components/clientprofile/ClientJobHistory'
import ClientMeasurementsSection from '../components/clientprofile/ClientMeasurementsSection'
import ClientProfileCard from '../components/clientprofile/ClientProfileCard'
import { useClientMeasurements } from '../components/clientprofile/useClientMeasurements'
import EmptyState from '../components/shared/EmptyState'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import { useAppFeedback } from '../components/shared/appFeedbackCore'
import PageHeader from '../components/shared/PageHeader'
import { useClientQuery, useSoftDeleteClientMutation } from '../hooks/useClientQueries'
import { useClientJobsQuery } from '../hooks/useJobQueries'
import { mapJobRow } from '../services/mappers/jobMapper'

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const feedback = useAppFeedback()
  const clientQuery = useClientQuery(id)
  const client = clientQuery.data
  const clientJobsQuery = useClientJobsQuery(client?.id)
  const clientJobs = useMemo(() => clientJobsQuery.data ?? [], [clientJobsQuery.data])
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
    const confirmed = await feedback.confirm({
      title: `Delete ${client.name}?`,
      message: 'This removes the client profile from your active client list.',
      confirmLabel: 'Delete client',
      tone: 'danger',
    })
    if (!confirmed) return

    try {
      await deleteClientMutation.mutateAsync(client.id)
      navigate('/clients')
    } catch (error) {
      feedback.toast(error instanceof Error ? error.message : 'Unable to delete client.', 'error')
    }
  }

  return (
    <section className="section stack gap-16 page-fab-clearance">
      <PageHeader
        title="Client Profile"
        centered
        leading={<HistoryBackButton fallbackTo="/clients" />}
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
