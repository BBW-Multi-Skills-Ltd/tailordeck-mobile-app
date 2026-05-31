import { CalendarDays, Clock3 } from 'lucide-react'
import { formatDateNumeric, formatDateWords, formatTimeWords } from './jobDetailUtils'

export function JobDeadlineSection({
  deadlineDate,
  deliveryTime,
  reminder,
}: {
  deadlineDate: string
  deliveryTime: string
  reminder: string
}) {
  return (
    <article className="card stack gap-10">
      <h4>Deadline</h4>
      <div className="stack gap-8">
        <p className="text-sm text-muted row gap-8">
          <CalendarDays size={15} />
          {formatDateNumeric(deadlineDate)}
        </p>
        <p className="text-sm font-semibold">{formatDateWords(deadlineDate)}</p>
        <p className="text-sm text-muted row gap-8">
          <Clock3 size={15} />
          {deliveryTime} ({formatTimeWords(deliveryTime)})
        </p>
        <p className="text-sm text-muted row gap-8">
          <Clock3 size={15} />
          Reminder: {reminder === 'none' ? 'No reminder' : reminder}
        </p>
      </div>
    </article>
  )
}
