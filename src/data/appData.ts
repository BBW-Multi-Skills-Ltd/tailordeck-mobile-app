import { mockClients } from './mockClients'
import { jobMeasurementById } from './mockJobMeasurements'
import { mockJobs } from './mockJobs'

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const appJobs = USE_MOCK_DATA ? mockJobs : []

export const appClients = USE_MOCK_DATA ? mockClients : []

export const appJobMeasurementById = USE_MOCK_DATA ? jobMeasurementById : {}
