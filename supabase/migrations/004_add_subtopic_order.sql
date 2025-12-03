-- Add order column to subtopics table
ALTER TABLE subtopics ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_subtopics_order ON subtopics(subject_id, display_order);

-- Update existing subtopics to have sequential order within their subject
DO $$
DECLARE
    subject_record RECORD;
    subtopic_record RECORD;
    order_counter INTEGER;
BEGIN
    FOR subject_record IN SELECT DISTINCT id FROM subjects LOOP
        order_counter := 0;
        FOR subtopic_record IN 
            SELECT id FROM subtopics 
            WHERE subject_id = subject_record.id 
            ORDER BY created_at
        LOOP
            UPDATE subtopics 
            SET display_order = order_counter 
            WHERE id = subtopic_record.id;
            order_counter := order_counter + 1;
        END LOOP;
    END LOOP;
END $$;

