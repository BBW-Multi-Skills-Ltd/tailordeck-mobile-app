import { formatNaira } from '../../../lib/utils'
import { numericValue } from '../newJobConfig'
import type { ReviewSummaryProps } from './reviewSummaryTypes'

export function getReviewDescription(props: ReviewSummaryProps): string {
  if (props.makeCategory !== 'Body Wear') return props.nonBodyDescription || '-'

  return props.persons
    .filter((person) => person.description.trim())
    .map((person) => `${person.name || 'Person'}: ${person.description}`)
    .join(', ') || '-'
}

export function getReviewItemType(props: ReviewSummaryProps): string {
  if (props.makeCategory !== 'Body Wear') return props.effectiveItemType || '-'
  if (props.sameItemForAll) return props.effectiveItemType || '-'
  return props.persons.map((person) => `${person.name || 'Person'}: ${person.itemType || '-'}`).join(', ')
}

export function getMeasurementSummary(props: ReviewSummaryProps): string {
  if (props.isAmendmentMode) return 'Amendment details captured'
  if (props.makeCategory === 'Body Wear') return `${props.persons.length} person profile(s) captured`
  return `${props.selectedNonBodyFields.length} item dimension(s) captured`
}

export function formatExpenses(expenses: ReviewSummaryProps['expenses']): string {
  if (!expenses.length) return '-'
  return expenses.map((expense) => `${expense.name} (${formatNaira(numericValue(expense.cost))})`).join(', ')
}
