export interface ProfileRow {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  phone_normalized: string | null
  avatar_url: string | null
  avatar_storage_path: string | null
  onboarding_complete: boolean | null
  account_status: string | null
  role: string | null
  deactivation_reason: string | null
  deactivated_at: string | null
  deletion_requested_at: string | null
  deletion_scheduled_at: string | null
  reactivated_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}
