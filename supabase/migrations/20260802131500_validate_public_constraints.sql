-- Production launch gate: prove every public-table constraint is valid against existing data.
-- If this migration fails, fix the dirty rows instead of ignoring the constraint.

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conrelid::regclass as table_name, conname
    from pg_constraint
    where connamespace = 'public'::regnamespace
      and convalidated = false
    order by conrelid::regclass::text, conname
  loop
    execute format(
      'alter table %s validate constraint %I',
      constraint_record.table_name,
      constraint_record.conname
    );
  end loop;
end $$;
