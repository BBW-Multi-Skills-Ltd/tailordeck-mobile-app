import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { appClients } from '../data/appData'
import type { Client, CreateClientInput } from '../types/client'

const STORAGE_KEY = 'tailordeck.clients.v1'

type ClientsContextValue = {
  clients: Client[]
  addClient: (input: CreateClientInput) => Client
  updateClient: (id: string, updates: Partial<CreateClientInput>) => Client | null
  deleteClient: (id: string) => void
  getClientById: (id: string) => Client | undefined
}

const ClientsContext = createContext<ClientsContextValue | undefined>(undefined)

function generateClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function loadInitialClients(): Client[] {
  if (typeof window === 'undefined') return appClients

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return appClients

  try {
    const parsed = JSON.parse(stored) as Client[]
    if (!Array.isArray(parsed)) return appClients

    const parsedIds = new Set(parsed.map((client) => client.id))
    const missingSeedClients = appClients.filter((client) => !parsedIds.has(client.id))
    return [...parsed, ...missingSeedClients]
  } catch {
    return appClients
  }
}

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(loadInitialClients)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
  }, [clients])

  const value = useMemo<ClientsContextValue>(() => {
    function addClient(input: CreateClientInput): Client {
      const timestamp = new Date().toISOString()
      const nextClient: Client = {
        id: generateClientId(),
        created_date: timestamp,
        updated_date: timestamp,
        created_by: 'local-user',
        name: input.name.trim(),
        phone: input.phone.trim(),
        sex: input.sex,
        measurement_unit: input.measurement_unit,
        last_job_date: timestamp.slice(0, 10),
        measurements: input.measurements,
      }

      setClients((prev) => [nextClient, ...prev])
      return nextClient
    }

    function updateClient(id: string, updates: Partial<CreateClientInput>): Client | null {
      let updatedClient: Client | null = null

      setClients((prev) =>
        prev.map((client) => {
          if (client.id !== id) return client

          updatedClient = {
            ...client,
            ...updates,
            name: updates.name?.trim() ?? client.name,
            phone: updates.phone?.trim() ?? client.phone,
            updated_date: new Date().toISOString(),
          }
          return updatedClient
        }),
      )

      return updatedClient
    }

    function deleteClient(id: string): void {
      setClients((prev) => prev.filter((client) => client.id !== id))
    }

    function getClientById(id: string): Client | undefined {
      return clients.find((client) => client.id === id)
    }

    return { clients, addClient, updateClient, deleteClient, getClientById }
  }, [clients])

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>
}

export { ClientsContext }

