import { normalizeNigerianPhone } from '../lib/phone'
import type { Client, CreateClientInput } from '../types/client'
import { supabase } from '../lib/supabase'
import { mapClientRow } from './mappers/clientMapper'
import type { ClientRow } from './types'
import { requireUserId } from './serviceHelpers'

export async function getClients(): Promise<Client[]> {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .returns<ClientRow[]>()
  if (error) throw error
  return (data ?? []).map(mapClientRow)
}

export async function getClient(id: string): Promise<Client | null> {
  const userId = await requireUserId()
  const { data, error } = await supabase.from('clients').select('*').eq('user_id', userId).eq('id', id).is('deleted_at', null).maybeSingle<ClientRow>()
  if (error) throw error
  return data ? mapClientRow(data) : null
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const userId = await requireUserId()
  const row = {
    user_id: userId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    phone_normalized: normalizeNigerianPhone(input.phone),
    sex: input.sex,
    measurement_unit: input.measurement_unit,
    last_job_date: new Date().toISOString().slice(0, 10),
  }
  const { data, error } = await supabase.from('clients').insert(row).select('*').single<ClientRow>()
  if (error) throw error
  return mapClientRow(data)
}

export async function updateClient(id: string, updates: Partial<CreateClientInput>): Promise<Client> {
  const userId = await requireUserId()
  const row = {
    name: updates.name?.trim(),
    phone: updates.phone?.trim(),
    phone_normalized: updates.phone ? normalizeNigerianPhone(updates.phone) : undefined,
    sex: updates.sex,
    measurement_unit: updates.measurement_unit,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('clients').update(row).eq('user_id', userId).eq('id', id).select('*').single<ClientRow>()
  if (error) throw error
  return mapClientRow(data)
}

export async function softDeleteClient(id: string): Promise<void> {
  const userId = await requireUserId()
  const { error } = await supabase.from('clients').update({ deleted_at: new Date().toISOString() }).eq('user_id', userId).eq('id', id)
  if (error) throw error
}
