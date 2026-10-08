-- Reference photos were never saved since 2026-10-06 (only the files reached storage).
--
-- uploadJobPhoto (src/services/photoService.ts) saves the photo row with
-- INSERT ... ON CONFLICT (job_id, storage_path) DO UPDATE, so retrying a failed save cannot create
-- duplicates. Postgres requires UPDATE privilege for ON CONFLICT DO UPDATE even when the row is new, and
-- authenticated only had INSERT and SELECT on this table, so every save failed with "permission denied".
-- The existing policy "Users manage own job reference photos" (FOR ALL, owner + own job) still limits
-- updates to the user's own rows.

grant update on table public.job_reference_photos to authenticated;
