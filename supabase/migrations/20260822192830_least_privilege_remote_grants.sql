-- Least-privilege cleanup for frontend-accessible roles.
--
-- This migration intentionally does not change RLS policies. It only tightens
-- table privileges and direct RPC/function EXECUTE grants after verifying the
-- current application query paths.

-- Remove broad table privileges inherited from earlier schema grants.
revoke all privileges on table
  public.profiles,
  public.business_profiles,
  public.business_social_handles,
  public.brand_settings,
  public.clients,
  public.jobs,
  public.job_persons,
  public.job_expenses,
  public.job_reference_photos,
  public.documents,
  public.subscriptions,
  public.notifications,
  public.support_tickets,
  public.user_preferences,
  public.account_audit_logs,
  public.edge_rate_limits,
  public.plans,
  public.plan_features
from anon, authenticated;

-- Public app configuration. These rows are still protected by RLS policies
-- that only expose active/enabled plan data.
grant select on table public.plans to anon, authenticated;
grant select on table public.plan_features to anon, authenticated;

-- User-owned application tables. RLS remains the row-level enforcement layer.
grant select, update on table public.profiles to authenticated;
grant select, insert, update on table public.business_profiles to authenticated;
grant select, insert, delete on table public.business_social_handles to authenticated;
grant select, insert, update on table public.brand_settings to authenticated;
grant select, insert, update on table public.clients to authenticated;
grant select, insert, update on table public.jobs to authenticated;
grant select, insert, update, delete on table public.job_persons to authenticated;
grant select, insert, delete on table public.job_expenses to authenticated;
grant select, insert on table public.job_reference_photos to authenticated;
grant select, insert, update on table public.documents to authenticated;
grant select on table public.subscriptions to authenticated;
grant select, update on table public.notifications to authenticated;
grant select, insert on table public.support_tickets to authenticated;
grant select, insert, update on table public.user_preferences to authenticated;
grant select on table public.account_audit_logs to authenticated;

-- edge_rate_limits is only used from Edge Functions with the service role.

-- Remove overly broad direct function execution from browser-accessible roles.
revoke all privileges on function public.activate_verified_profile(text, text, text) from public, anon, authenticated;
revoke all privileges on function public.deactivate_account(text) from public, anon, authenticated;
revoke all privileges on function public.request_account_deletion(text) from public, anon, authenticated;
revoke all privileges on function public.restore_account() from public, anon, authenticated;
revoke all privileges on function public.start_free_trial_subscription() from public, anon, authenticated;
revoke all privileges on function public.set_subscription_cancel_at_period_end(boolean) from public, anon, authenticated;
revoke all privileges on function public.has_feature_access(text) from public, anon, authenticated;
revoke all privileges on function public.get_dashboard_monthly_stats(integer) from public, anon, authenticated;
revoke all privileges on function public.get_dashboard_status_breakdown() from public, anon, authenticated;
revoke all privileges on function public.get_dashboard_status_breakdown(text) from public, anon, authenticated;

-- Authenticated-only RPCs used by the frontend.
grant execute on function public.activate_verified_profile(text, text, text) to authenticated;
grant execute on function public.deactivate_account(text) to authenticated;
grant execute on function public.request_account_deletion(text) to authenticated;
grant execute on function public.restore_account() to authenticated;
grant execute on function public.start_free_trial_subscription() to authenticated;
grant execute on function public.set_subscription_cancel_at_period_end(boolean) to authenticated;
grant execute on function public.has_feature_access(text) to authenticated;
grant execute on function public.get_dashboard_monthly_stats(integer) to authenticated;
grant execute on function public.get_dashboard_status_breakdown() to authenticated;
grant execute on function public.get_dashboard_status_breakdown(text) to authenticated;

-- Internal/trigger/helper functions should not be directly callable from
-- anon/authenticated clients. Existing triggers keep working after EXECUTE is
-- revoked from client roles.
revoke all privileges on function public.guard_profile_account_status() from public, anon, authenticated;
revoke all privileges on function public.handle_new_user() from public, anon, authenticated;
revoke all privileges on function public.enforce_support_ticket_rate_limit() from public, anon, authenticated;
revoke all privileges on function public.rls_auto_enable() from public, anon, authenticated;
revoke all privileges on function public.refresh_job_expense_totals() from public, anon, authenticated;
revoke all privileges on function public.update_updated_at() from public, anon, authenticated;
revoke all privileges on function public.update_updated_at_and_version() from public, anon, authenticated;
revoke all privileges on function public.normalize_ng_phone(text) from public, anon, authenticated;

-- Service-role-only account cleanup RPC.
revoke all privileges on function public.list_due_account_deletions(integer) from public, anon, authenticated;
grant execute on function public.list_due_account_deletions(integer) to service_role;
