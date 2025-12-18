-- Create card_mastery table to track how many times each user has answered each card correctly
CREATE TABLE IF NOT EXISTS card_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id uuid REFERENCES flashcards(id) ON DELETE CASCADE NOT NULL,
  correct_count integer DEFAULT 0 NOT NULL,
  last_updated timestamptz DEFAULT NOW(),
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_card_mastery_user_id ON card_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_card_mastery_card_id ON card_mastery(card_id);
CREATE INDEX IF NOT EXISTS idx_card_mastery_user_card ON card_mastery(user_id, card_id);

-- Enable RLS on card_mastery table
ALTER TABLE card_mastery ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own card mastery records
CREATE POLICY "Users can insert their own card mastery"
  ON card_mastery
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can read their own card mastery records
CREATE POLICY "Users can read their own card mastery"
  ON card_mastery
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can update their own card mastery records
CREATE POLICY "Users can update their own card mastery"
  ON card_mastery
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own card mastery records
CREATE POLICY "Users can delete their own card mastery"
  ON card_mastery
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

