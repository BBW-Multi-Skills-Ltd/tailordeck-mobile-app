import { ChevronLeft, ChevronRight } from 'lucide-react'

type DashboardMonthNavProps = {
  label: string
  monthOffset: number
  onPrevious: () => void
  onNext: () => void
}

export default function DashboardMonthNav({ label, monthOffset, onNext, onPrevious }: DashboardMonthNavProps) {
  return (
    <div className="dashboard-month-nav">
      <button type="button" className="btn btn-ghost btn-icon" onClick={onPrevious} aria-label="Previous month">
        <ChevronLeft size={18} />
      </button>
      <p className="dashboard-month-label">{label}</p>
      <button type="button" className="btn btn-ghost btn-icon" onClick={onNext} aria-label="Next month" disabled={monthOffset === 0}>
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
