import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NewClientForm } from '../components/clients/NewClientForm'
import { useNewClientForm } from '../components/clients/useNewClientForm'

export default function NewClient() {
  const form = useNewClientForm()

  return (
    <section className="section stack gap-16">
      <div className="row-between">
        <Link to="/clients" className="btn btn-ghost btn-icon" aria-label="Back to clients">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="app-page-heading">New Client</h2>
        <span style={{ width: '44px' }} />
      </div>
      <NewClientForm form={form} />
    </section>
  )
}
