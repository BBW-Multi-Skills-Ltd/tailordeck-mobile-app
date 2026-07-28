import { NewClientForm } from '../components/clients/NewClientForm'
import { useNewClientForm } from '../components/clients/useNewClientForm'
import HistoryBackButton from '../components/shared/HistoryBackButton'
import PageHeader from '../components/shared/PageHeader'

export default function NewClient() {
  const form = useNewClientForm()

  return (
    <section className="section stack gap-16">
      <PageHeader
        title="New Client"
        centered
        leading={<HistoryBackButton fallbackTo="/clients" />}
      />
      <NewClientForm form={form} />
    </section>
  )
}
