import type { PersonForm } from './newJobTypes'

export function newPerson(overrides?: Partial<PersonForm>): PersonForm {
  return {
    id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: '',
    sex: 'Female',
    role: 'adult',
    age: '',
    itemType: '',
    description: '',
    measurements: {},
    ...overrides,
  }
}

