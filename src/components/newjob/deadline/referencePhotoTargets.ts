import type { JobType, MakeCategory, PersonForm } from '../newJobConfig'
import type { ReferencePhotoTarget } from '../ReferencePhotoUpload'

export function getReferencePhotoTargets(params: {
  clientName: string
  effectiveItemType: string
  jobType: JobType
  makeCategory: MakeCategory
  persons: PersonForm[]
  sameItemForAll: boolean
}): ReferencePhotoTarget[] {
  const { clientName, effectiveItemType, jobType, makeCategory, persons, sameItemForAll } = params
  const itemLabel = effectiveItemType || 'Style guide'

  if (makeCategory !== 'Body Wear' || jobType === 'Single') {
    const primaryPerson = persons[0]
    return [
      {
        id: primaryPerson?.id ?? 'primary',
        label: `Upload for ${primaryPerson?.name || clientName || 'client'}`,
        meta: itemLabel,
        maxFiles: 2,
      },
    ]
  }

  if (sameItemForAll) {
    return [
      {
        id: 'shared',
        label: 'Upload shared inspiration',
        meta: `${jobType} - ${itemLabel}`,
        maxFiles: 3,
      },
    ]
  }

  return persons.map((person, index) => ({
    id: person.id,
    label: `Upload for ${person.name || (index === 0 ? clientName || 'client' : `Person ${index + 1}`)}`,
    meta: person.itemType || itemLabel,
    maxFiles: 2,
  }))
}
