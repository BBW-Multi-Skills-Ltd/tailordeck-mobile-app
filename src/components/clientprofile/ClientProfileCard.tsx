import { Phone, UserRound } from 'lucide-react'
import type { Client } from '../../types/client'
import { getInitial } from '../../lib/utils'

type ClientProfileCardProps = {
  client: Client
}

export default function ClientProfileCard({ client }: ClientProfileCardProps) {
  return (
    <article className="card stack gap-12">
      <div className="row gap-12">
        <div className="client-avatar" style={{ width: 56, height: 56, fontSize: 22 }}>
          {getInitial(client.name)}
        </div>
        <div className="stack gap-4">
          <h3>{client.name}</h3>
          <div className="row gap-12 text-sm text-muted">
            <span className="row gap-4">
              <UserRound size={14} />
              {client.sex}
            </span>
            <span className="row gap-4">
              <Phone size={14} />
              {client.phone}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
