-- Create essays table
CREATE TABLE IF NOT EXISTS essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url text,
  essay_text text NOT NULL,
  feedback text,
  score integer,
  max_score integer,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'graded')),
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  reviewed_at timestamptz
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_essays_user_id ON essays(user_id);
CREATE INDEX IF NOT EXISTS idx_essays_status ON essays(status);
CREATE INDEX IF NOT EXISTS idx_essays_created_at ON essays(created_at DESC);

-- Enable RLS on essays table
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own essays
CREATE POLICY "Users can insert their own essays"
  ON essays
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can read their own essays
CREATE POLICY "Users can read their own essays"
  ON essays
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can update their own essays (before review)
CREATE POLICY "Users can update their own essays"
  ON essays
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Allow public read access for admins (we'll check admin status in application)
-- For now, allow authenticated users to read all essays (admin check in app)
CREATE POLICY "Allow authenticated users to read all essays"
  ON essays
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to update essays (for admin feedback)
CREATE POLICY "Allow authenticated users to update essays"
  ON essays
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Note: You need to create a storage bucket named 'essays' in Supabase Dashboard
-- Go to Storage > Create Bucket > Name: essays > Public: Yes
-- Then add these policies in the Storage policies section:
-- 
-- Policy 1: Allow authenticated users to upload
-- Name: Allow authenticated uploads
-- Operation: INSERT
-- Target roles: authenticated
-- Policy definition: (bucket_id = 'essays'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
--
-- Policy 2: Allow public read access
-- Name: Allow public read access
-- Operation: SELECT
-- Target roles: public
-- Policy definition: bucket_id = 'essays'::text

