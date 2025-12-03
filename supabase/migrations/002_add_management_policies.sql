-- Add INSERT policies for subjects
CREATE POLICY "Allow public insert access to subjects"
  ON subjects
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Add UPDATE policies for subjects
CREATE POLICY "Allow public update access to subjects"
  ON subjects
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Add DELETE policies for subjects
CREATE POLICY "Allow public delete access to subjects"
  ON subjects
  FOR DELETE
  TO public
  USING (true);

-- Add INSERT policies for subtopics
CREATE POLICY "Allow public insert access to subtopics"
  ON subtopics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Add UPDATE policies for subtopics
CREATE POLICY "Allow public update access to subtopics"
  ON subtopics
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Add DELETE policies for subtopics
CREATE POLICY "Allow public delete access to subtopics"
  ON subtopics
  FOR DELETE
  TO public
  USING (true);

-- Add INSERT policies for flashcards
CREATE POLICY "Allow public insert access to flashcards"
  ON flashcards
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Add UPDATE policies for flashcards
CREATE POLICY "Allow public update access to flashcards"
  ON flashcards
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Add DELETE policies for flashcards
CREATE POLICY "Allow public delete access to flashcards"
  ON flashcards
  FOR DELETE
  TO public
  USING (true);

