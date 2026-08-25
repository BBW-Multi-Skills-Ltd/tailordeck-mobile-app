import { describe, expect, it } from 'vitest'
import { mapClientRow } from '../clientMapper'
import { mapJobCreateMoney, mapJobRow } from '../jobMapper'
import { mapNotificationRow } from '../notificationMapper'
import { mergeSettingsRows } from '../settingsMapper'
import { mapJobStatusFromDb, mapJobStatusToDb } from '../statusMapper'
import type { ClientRow, JobRow, NotificationRow } from '../../types'

const createdAt = '2026-08-02T10:00:00.000Z'
const updatedAt = '2026-08-02T12:00:00.000Z'

function makeJobRow(overrides: Partial<JobRow> = {}): JobRow {
  return {
    id: 'job-1',
    user_id: 'user-1',
    client_id: 'client-1',
    client_name: 'Faith Menu',
    client_phone: '08012345678',
    client_phone_normalized: '2348012345678',
    title: null,
    order_mode: 'New Stitch',
    make_category: 'Body Wear',
    order_scope: 'Single',
    same_item_for_all: true,
    item_type: 'Agbada',
    description: null,
    amendment_issue_type: null,
    amendment_area: null,
    amendment_target: null,
    amendment_description: null,
    amendment_needs_materials: null,
    amendment_part_name: null,
    amendment_part_quantity: null,
    material_type: 'Ankara',
    material_color: 'Blue',
    material_yards: 5,
    material_quality: 'Original',
    material_source: 'I Am Getting It',
    charge_amount_kobo: 2500000,
    deposit_percent: 50,
    deposit_amount_kobo: 1250000,
    balance_amount_kobo: 1250000,
    total_expenses_kobo: 500000,
    profit_kobo: 2000000,
    is_worth_it: true,
    deadline_date: '2026-08-10',
    deadline_time: '14:30',
    reminder: '1 day before',
    status: 'in_progress',
    completed_at: null,
    deleted_at: null,
    created_at: createdAt,
    updated_at: updatedAt,
    ...overrides,
  }
}

describe('service mappers', () => {
  it('maps job rows to UI jobs without leaking database column names', () => {
    expect(mapJobRow(makeJobRow())).toEqual({
      id: 'job-1',
      clientId: 'client-1',
      clientName: 'Faith Menu',
      clientPhone: '08012345678',
      title: 'Agbada',
      jobType: 'Single',
      chargeAmount: 25000,
      status: 'In Progress',
      deadlineDate: '2026-08-10',
      createdDate: '2026-08-02',
    })
  })

  it('falls back to safe job display values when optional fields are missing', () => {
    const mapped = mapJobRow(makeJobRow({ client_id: null, client_phone: null, deadline_date: null, item_type: null, title: null }))

    expect(mapped.clientId).toBe('')
    expect(mapped.clientPhone).toBe('')
    expect(mapped.title).toBe('Tailoring job')
    expect(mapped.deadlineDate).toBe('2026-08-02')
  })

  it('maps money fields into integer kobo values', () => {
    expect(mapJobCreateMoney({ chargeAmount: 12500, depositPercent: 40 })).toEqual({
      charge_amount_kobo: 1250000,
      deposit_percent: 40,
      deposit_amount_kobo: 500000,
    })
  })

  it('maps job statuses both directions', () => {
    expect(mapJobStatusFromDb('draft')).toBe('Draft')
    expect(mapJobStatusFromDb('completed')).toBe('Completed')
    expect(mapJobStatusFromDb('in_progress')).toBe('In Progress')
    expect(mapJobStatusFromDb('pending')).toBe('Pending')

    expect(mapJobStatusToDb('Draft')).toBe('draft')
    expect(mapJobStatusToDb('Completed')).toBe('completed')
    expect(mapJobStatusToDb('In Progress')).toBe('in_progress')
    expect(mapJobStatusToDb('Pending')).toBe('pending')
  })

  it('maps client rows and falls back to updated date for last job date', () => {
    const row: ClientRow = {
      id: 'client-1',
      user_id: 'user-1',
      name: 'Queen Mabel',
      phone: '08012345678',
      phone_normalized: '2348012345678',
      sex: 'Female',
      measurement_unit: 'inches',
      last_job_date: null,
      deleted_at: null,
      created_at: createdAt,
      updated_at: updatedAt,
    }

    expect(mapClientRow(row)).toMatchObject({
      id: 'client-1',
      created_by: 'user-1',
      name: 'Queen Mabel',
      last_job_date: '2026-08-02',
      measurements: {},
    })
  })

  it('maps notification rows into app notification cards', () => {
    const row: NotificationRow = {
      id: 'notification-1',
      user_id: 'user-1',
      type: 'invoice',
      title: 'Invoice sent',
      message: 'Invoice was shared with the client.',
      action_url: null,
      read_at: null,
      scheduled_for: null,
      deleted_at: null,
      created_at: createdAt,
      updated_at: updatedAt,
    }

    expect(mapNotificationRow(row)).toEqual({
      id: 'notification-1',
      type: 'document',
      title: 'Invoice sent',
      message: 'Invoice was shared with the client.',
      href: '/',
      createdAt,
      read: false,
    })
  })

  it('preselects invoice business detail pills from onboarding business details when brand settings do not exist yet', () => {
    const settings = mergeSettingsRows({
      business: {
        id: 'business-1',
        user_id: 'user-1',
        shop_name: 'Faith Shop',
        shop_address: 'Lagos, Nigeria',
        business_phone: '+2349010851071',
        business_phone_normalized: '2349010851071',
        business_email: 'shop@example.com',
        website: 'tailordeck.com.ng',
        cac_registration_number: 'RC12345',
        created_at: createdAt,
        updated_at: updatedAt,
      },
      handles: [{ id: 'handle-1', user_id: 'user-1', platform: 'Instagram', handle: '@faithshop', created_at: createdAt, updated_at: updatedAt }],
      brand: null,
    })

    expect(settings.brand.includeBusinessDetails).toEqual({
      phone: true,
      email: true,
      website: true,
      social: true,
      address: true,
      cac: true,
    })
  })
})
