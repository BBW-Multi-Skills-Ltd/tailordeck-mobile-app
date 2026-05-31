import {
  ChevronRight,
  Layers2,
  Package,
  Palette,
  Ruler,
  ShieldCheck,
  Tag,
  Truck,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { DetailedJobData } from '../../data/mockJobDetails'
import type { MockJob } from '../../types/job'

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
}) {
  return (
    <div className="row-between">
      <p className="text-sm text-muted row gap-4">
        {icon}
        {label}
      </p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}

export function JobInfoSection({
  job,
  details,
  measurementScopeText,
}: {
  job: MockJob
  details: DetailedJobData
  measurementScopeText: string
}) {
  return (
    <article className="card stack gap-10">
      <h4>Job Information</h4>
      <div className="stack gap-8">
        <InfoRow icon={<Layers2 size={14} />} label="Order Mode" value={details.orderMode} />
        <InfoRow icon={<Layers2 size={14} />} label="Job Type" value={details.jobType} />
        <InfoRow icon={<Tag size={14} />} label="Item Type" value={details.itemType} />
        <InfoRow icon={<Users size={14} />} label="Order Scope" value={job.jobType} />
        <div className="row-between">
          <p className="text-sm text-muted row gap-4">
            <Ruler size={14} />
            Measurement
          </p>
          <div className="row gap-8">
            <p className="text-sm font-semibold">{measurementScopeText}</p>
            <Link to={`/jobs/${job.id}/measurements`} className="job-measure-link">
              <span>View</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
        <InfoRow icon={<Package size={14} />} label="Material Type" value={details.materialType} />
        <InfoRow icon={<Palette size={14} />} label="Color" value={details.color} />
        <InfoRow icon={<Ruler size={14} />} label="Total Yard" value={details.totalYard} />
        <InfoRow icon={<ShieldCheck size={14} />} label="Material Quality" value={details.materialQuality} />
        <InfoRow icon={<Truck size={14} />} label="Material Source" value={details.materialSource} />
      </div>
    </article>
  )
}
