import { toLocalDateKey } from '../lib/localDate'
import { normalizeNigerianPhone } from '../lib/phone'
import type { Client, CreateClientInput } from '../types/client'
import { supabase } from '../lib/supabase'
import { mapClientRow } from './mappers/clientMapper'
import type { ClientRow } from './types'
import { requireUserId } from './serviceHelpers'
import { LIST_PAGE_SIZE, toIlikeTerm, toListPage, type ListPage } from './listPaging'

/** One page of clients, most recently updated first. Search runs on the server across all clients. */
export async function getClientsPage(params: { search?: string; offset?: number }): Promise<ListPage<Client>> {
  const userId = await requireUserId()
  const offset = params.offset ?? 0
  let query = supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .order('id', { ascending: false })
    .range(offset, offset + LIST_PAGE_SIZE)
  const term = toIlikeTerm(params.search)
  if (term) query = query.ilike('name', term)

  const { data, error } = await query.returns<ClientRow[]>()
  if (error) throw error
  return toListPage(data ?? [], offset, mapClientRow)
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
    last_job_date: toLocalDateKey(),
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
