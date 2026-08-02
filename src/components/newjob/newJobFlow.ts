import { appJobMeasurementById, appJobs } from '../../data/appData'
import type { JobMeasurementSnapshot } from '../../types/measurements'
import type { Client } from '../../types/client'
import { measurementNumbersToStrings, newPerson, type JobType, type PersonForm } from './newJobConfig'

export function latestMeasurementForClient(clientId: string): JobMeasurementSnapshot | undefined {
  const clientJobs = appJobs
    .filter((job) => job.clientId === clientId && appJobMeasurementById[job.id])
    .sort((a, b) => {
      if (a.status === 'Completed' && b.status !== 'Completed') return -1
      if (a.status !== 'Completed' && b.status === 'Completed') return 1
      return a.createdDate < b.createdDate ? 1 : -1
    })

  return clientJobs[0] ? appJobMeasurementById[clientJobs[0].id] : undefined
}

export function snapshotPersonsToForm(snapshot: Extract<JobMeasurementSnapshot, { kind: 'body' }>, client: Client): PersonForm[] {
  return snapshot.persons.map((person, index) =>
    newPerson({
      id: person.id,
      name: index === 0 ? client.name : person.name,
      sex: person.sex,
      role: person.role,
      itemType: person.itemType || snapshot.itemType,
      description: person.description || '',
      measurements: measurementNumbersToStrings(person.measurements),
    }),
  )
}

export function ensurePersonsForJobType(jobType: JobType, prevPersons: PersonForm[], clientName: string): PersonForm[] {
  const primaryName = clientName.trim()

  if (jobType === 'Single') {
    const existing = prevPersons[0]
    return [
      existing
        ? { ...existing, name: primaryName || existing.name || 'Client', role: 'adult', sex: existing.sex === 'Boy' || existing.sex === 'Girl' ? 'Female' : existing.sex }
        : newPerson({ name: primaryName || 'Client', sex: 'Female', role: 'adult' }),
    ]
  }

  if (jobType === 'Couple') {
    const first = prevPersons[0] ?? newPerson({ name: primaryName || 'Client', sex: 'Male', role: 'adult' })
    const second = prevPersons[1] ?? newPerson({ name: 'Person 2', sex: 'Female', role: 'adult' })
    return [
      { ...first, name: primaryName || first.name || 'Client', role: 'adult', sex: first.sex === 'Boy' || first.sex === 'Girl' ? 'Male' : first.sex },
      { ...second, role: 'adult', sex: second.sex === 'Boy' || second.sex === 'Girl' ? 'Female' : second.sex },
    ]
  }

  const adults = prevPersons.filter((person) => person.role === 'adult')
  const children = prevPersons.filter((person) => person.role === 'child')
  const firstAdult = adults[0] ?? newPerson({ name: primaryName || 'Client', sex: 'Male', role: 'adult' })
  const secondAdult = adults[1] ?? newPerson({ name: 'Adult 2', sex: 'Female', role: 'adult' })
  const extraAdults = adults.slice(2).map((adult, index) => ({
    ...adult,
    role: 'adult' as const,
    sex: adult.sex === 'Boy' || adult.sex === 'Girl' ? (index % 2 === 0 ? 'Male' : 'Female') : adult.sex,
  }))

  return [
    { ...firstAdult, name: primaryName || firstAdult.name || 'Client', role: 'adult', sex: firstAdult.sex === 'Boy' || firstAdult.sex === 'Girl' ? 'Male' : firstAdult.sex },
    { ...secondAdult, role: 'adult', sex: secondAdult.sex === 'Boy' || secondAdult.sex === 'Girl' ? 'Female' : secondAdult.sex },
    ...extraAdults,
    ...children,
  ]
}
