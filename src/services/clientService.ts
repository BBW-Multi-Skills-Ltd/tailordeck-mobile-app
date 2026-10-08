import type { Client } from '../types/client'
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

export async function softDeleteClient(id: string): Promise<void> {
  const userId = await requireUserId()
  const { error } = await supabase.from('clients').update({ deleted_at: new Date().toISOString() }).eq('user_id', userId).eq('id', id)
  if (error) throw error
}
