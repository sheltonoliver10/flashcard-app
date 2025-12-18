-- Create study_sessions table to track user study session results
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  subtopic_id uuid REFERENCES subtopics(id) ON DELETE CASCADE,
  study_mode text NOT NULL CHECK (study_mode IN ('subject', 'subtopic', 'random')),
  total_cards integer NOT NULL,
  correct_count integer NOT NULL,
  incorrect_count integer NOT NULL,
  percentage_correct numeric(5, 2) NOT NULL,
  is_review_mode boolean DEFAULT false,
  created_at timestamptz DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject_id ON study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_subject ON study_sessions(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created_at ON study_sessions(created_at DESC);

-- Enable RLS on study_sessions table
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own study sessions
CREATE POLICY "Users can insert their own study sessions"
  ON study_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can read their own study sessions
CREATE POLICY "Users can read their own study sessions"
  ON study_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can update their own study sessions
CREATE POLICY "Users can update their own study sessions"
  ON study_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own study sessions
CREATE POLICY "Users can delete their own study sessions"
  ON study_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

