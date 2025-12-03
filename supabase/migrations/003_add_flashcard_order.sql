-- Add order column to flashcards table
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_flashcards_order ON flashcards(subject_id, subtopic_id, display_order);

-- Update existing flashcards to have sequential order within their subtopic
DO $$
DECLARE
    subtopic_record RECORD;
    card_record RECORD;
    order_counter INTEGER;
BEGIN
    FOR subtopic_record IN SELECT DISTINCT subtopic_id FROM flashcards WHERE subtopic_id IS NOT NULL LOOP
        order_counter := 0;
        FOR card_record IN 
            SELECT id FROM flashcards 
            WHERE subtopic_id = subtopic_record.subtopic_id 
            ORDER BY created_at
        LOOP
            UPDATE flashcards 
            SET display_order = order_counter 
            WHERE id = card_record.id;
            order_counter := order_counter + 1;
        END LOOP;
    END LOOP;
END $$;

