export type ClientSex = 'Male' | 'Female'
export type MeasurementUnit = 'cm' | 'inches'

export interface ClientMeasurements {
  chest?: number
  bust?: number
  waist?: number
  shoulder?: number
  hip?: number
  inseam?: number
  sleeve?: number
  neck?: number
  thigh?: number
  ankle?: number
  head?: number
}

export interface Client {
  id: string
  created_date: string
  updated_date: string
  created_by: string
  name: string
  phone: string
  sex: ClientSex
  measurement_unit: MeasurementUnit
  last_job_date: string
  measurements: ClientMeasurements
}

export interface CreateClientInput {
  name: string
  phone: string
  sex: ClientSex
  measurement_unit: MeasurementUnit
  measurements: ClientMeasurements
}

