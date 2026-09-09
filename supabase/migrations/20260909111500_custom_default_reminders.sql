alter table public.user_preferences
  add column if not exists default_custom_reminder_value integer,
  add column if not exists default_custom_reminder_unit text,
  add column if not exists default_custom_reminder_minutes integer,
  add column if not exists default_reminder_label text;

update public.user_preferences
set default_reminder_label = case
  when default_reminder = 'none' then 'No reminder'
  else default_reminder
end
where default_reminder_label is null;

alter table public.user_preferences
  drop constraint if exists user_preferences_default_reminder_check,
  drop constraint if exists user_preferences_default_custom_reminder_unit_check,
  drop constraint if exists user_preferences_default_custom_reminder_range_check,
  drop constraint if exists user_preferences_default_custom_reminder_required_check;

alter table public.user_preferences
  add constraint user_preferences_default_reminder_check
    check (default_reminder = any (array['1 day before'::text, '3 days before'::text, '1 week before'::text, 'custom'::text, 'none'::text])) not valid,
  add constraint user_preferences_default_custom_reminder_unit_check
    check (default_custom_reminder_unit is null or default_custom_reminder_unit = any (array['minutes'::text, 'hours'::text, 'days'::text, 'weeks'::text])) not valid,
  add constraint user_preferences_default_custom_reminder_range_check
    check (default_custom_reminder_minutes is null or default_custom_reminder_minutes between 10 and 43200) not valid,
  add constraint user_preferences_default_custom_reminder_required_check
    check (
      default_reminder <> 'custom'
      or (
        default_custom_reminder_value is not null
        and default_custom_reminder_value > 0
        and default_custom_reminder_unit is not null
        and default_custom_reminder_minutes is not null
        and default_reminder_label is not null
        and btrim(default_reminder_label) <> ''
      )
    ) not valid;

alter table public.user_preferences validate constraint user_preferences_default_reminder_check;
alter table public.user_preferences validate constraint user_preferences_default_custom_reminder_unit_check;
alter table public.user_preferences validate constraint user_preferences_default_custom_reminder_range_check;
alter table public.user_preferences validate constraint user_preferences_default_custom_reminder_required_check;
