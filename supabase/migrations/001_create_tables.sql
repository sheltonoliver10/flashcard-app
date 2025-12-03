-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT NOW()
);

-- Create subtopics table
CREATE TABLE IF NOT EXISTS subtopics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  subtopic_id uuid REFERENCES subtopics(id) ON DELETE CASCADE,
  front_text text NOT NULL,
  back_text text NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_subtopics_subject_id ON subtopics(subject_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_subject_id ON flashcards(subject_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_subtopic_id ON flashcards(subtopic_id);

-- Enable RLS on all tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to subjects
CREATE POLICY "Allow public read access to subjects"
  ON subjects
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow public read access to subtopics
CREATE POLICY "Allow public read access to subtopics"
  ON subtopics
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow public read access to flashcards
CREATE POLICY "Allow public read access to flashcards"
  ON flashcards
  FOR SELECT
  TO public
  USING (true);

