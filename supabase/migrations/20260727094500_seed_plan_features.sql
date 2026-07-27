insert into public.plans (name, display_name, monthly_price_kobo, yearly_price_kobo, trial_days, is_active)
values
  ('free', '14 Days Free Trial', 0, 0, 14, true),
  ('starter', 'Starter', 250000, 2400000, 0, true),
  ('pro', 'Pro', 450000, 4200000, 0, true)
on conflict (name) do update set
  display_name = excluded.display_name,
  monthly_price_kobo = excluded.monthly_price_kobo,
  yearly_price_kobo = excluded.yearly_price_kobo,
  trial_days = excluded.trial_days,
  is_active = excluded.is_active;

insert into public.plan_features (plan_name, feature_key, is_enabled)
values
  ('free', 'pdf_export', true),
  ('free', 'document_sending', true),
  ('free', 'dashboard_analytics', true),
  ('free', 'full_document_setup', true),
  ('starter', 'pdf_export', false),
  ('starter', 'document_sending', false),
  ('starter', 'dashboard_analytics', false),
  ('starter', 'full_document_setup', false),
  ('pro', 'pdf_export', true),
  ('pro', 'document_sending', true),
  ('pro', 'dashboard_analytics', true),
  ('pro', 'full_document_setup', true)
on conflict (plan_name, feature_key) do update set
  is_enabled = excluded.is_enabled;
