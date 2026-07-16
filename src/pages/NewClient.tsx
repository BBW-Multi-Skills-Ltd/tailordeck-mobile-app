import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NewClientForm } from '../components/clients/NewClientForm'
import { useNewClientForm } from '../components/clients/useNewClientForm'
import PageHeader from '../components/shared/PageHeader'

export default function NewClient() {
  const form = useNewClientForm()

  return (
    <section className="section stack gap-16">
      <PageHeader
        title="New Client"
        centered
        leading={(
          <Link to="/clients" className="btn btn-ghost btn-icon" aria-label="Back to clients">
            <ArrowLeft size={18} />
          </Link>
        )}
      />
      <NewClientForm form={form} />
    </section>
  )
}
