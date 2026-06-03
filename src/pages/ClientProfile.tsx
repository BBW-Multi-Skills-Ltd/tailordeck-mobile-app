import { ArrowLeft, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ClientJobHistory from '../components/clientprofile/ClientJobHistory'
import ClientMeasurementsSection from '../components/clientprofile/ClientMeasurementsSection'
import ClientProfileCard from '../components/clientprofile/ClientProfileCard'
import { useClientMeasurements } from '../components/clientprofile/useClientMeasurements'
import { appJobs } from '../data/appData'
import { useClients } from '../hooks/useClients'

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { deleteClient, getClientById } = useClients()
  const client = id ? getClientById(id) : undefined
  const measurements = useClientMeasurements(client?.id)

  const completedJobs = useMemo(
    () =>
      appJobs
        .filter((job) => job.clientId === client?.id && job.status === 'Completed')
        .sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1)),
    [client?.id],
  )
  const measurementJobs = useMemo(
    () =>
      appJobs
        .filter((job) => job.clientId === client?.id)
        .sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1)),
    [client?.id],
  )

  if (!client) {
    return (
      <section className="section stack gap-16">
        <h2 className="app-page-heading">Client Not Found</h2>
        <p className="text-muted">This client may have been deleted.</p>
        <Link to="/clients" className="btn btn-secondary">
          Back to Clients
        </Link>
      </section>
    )
  }

  function handleDeleteClient(): void {
    if (!client) return
    const confirmed = window.confirm(`Delete ${client.name}? This will remove this client profile. This action cannot be undone.`)
    if (!confirmed) return

    deleteClient(client.id)
    navigate('/clients')
  }

  return (
    <section className="section stack gap-16 page-fab-clearance">
      <div className="row-between">
        <Link to="/clients" className="btn btn-ghost btn-icon" aria-label="Back to clients">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="app-page-heading">Client Profile</h2>
        <span style={{ width: '44px' }} />
      </div>

      <ClientProfileCard client={client} />

      <ClientMeasurementsSection
        isEditing={measurements.isEditing}
        measurementDrafts={measurements.measurementDrafts}
        measurementJobs={measurementJobs}
        onToggleEdit={measurements.toggleEdit}
        onUpdateBodyMeasurement={measurements.updateBodyMeasurement}
        onUpdateNonBodyMeasurement={measurements.updateNonBodyMeasurement}
      />

      <ClientJobHistory jobs={completedJobs} />

      <button type="button" className="btn btn-primary btn-full" onClick={() => navigate(`/jobs/new?clientId=${client.id}`)}>
        Start Another Job for This Client
      </button>

      <button type="button" className="btn btn-danger btn-full" onClick={handleDeleteClient}>
        <Trash2 size={16} />
        Delete Client
      </button>
    </section>
  )
}
