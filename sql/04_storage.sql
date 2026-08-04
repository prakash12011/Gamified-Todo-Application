-- =============================================================================
-- 04_storage.sql
-- Creates the avatars storage bucket and its access policies.
--
-- NOTE: Supabase does not allow creating buckets via SQL in all project
-- tiers.  If the INSERT below fails, create the bucket manually:
--   Dashboard → Storage → New bucket → name: "avatars" → Public: OFF
-- Then run only the policy statements below.
-- =============================================================================

-- Create the avatars bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  false,                          -- private bucket; signed URLs used for access
  5242880,                        -- 5 MB max per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- Storage RLS policies
-- -----------------------------------------------------------------------

-- Users can upload their own avatar (path must start with their user_id)
CREATE POLICY "avatars: upload own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Users can update (replace) their own avatar
CREATE POLICY "avatars: update own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Users can delete their own avatar
CREATE POLICY "avatars: delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Users can read their own avatar (and admins / service role can read all)
CREATE POLICY "avatars: read own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
