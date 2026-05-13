import type { Client } from '../types/client'

const nowIso = new Date().toISOString()

export const mockClients: Client[] = [
  {
    id: 'c-001',
    created_date: nowIso,
    updated_date: nowIso,
    created_by: 'demo@tailordeck.app',
    name: 'Adeola Johnson',
    phone: '08034567890',
    sex: 'Female',
    measurement_unit: 'cm',
    last_job_date: '2026-05-04',
    measurements: {
      bust: 38,
      shoulder: 16,
      sleeve: 24,
      waist: 31,
      hip: 41,
      thigh: 24,
      inseam: 31,
      ankle: 10,
      neck: 14,
    },
  },
  {
    id: 'c-002',
    created_date: nowIso,
    updated_date: nowIso,
    created_by: 'demo@tailordeck.app',
    name: 'Emeka Okafor',
    phone: '08123456789',
    sex: 'Male',
    measurement_unit: 'inches',
    last_job_date: '2026-05-11',
    measurements: {
      chest: 42,
      shoulder: 18,
      sleeve: 26,
      waist: 35,
      hip: 40,
      thigh: 24,
      inseam: 33,
      ankle: 11,
      neck: 16,
    },
  },
]

