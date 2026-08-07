-- Fix the column name conflict in the review table
-- Run this in your Supabase SQL editor

ALTER TABLE review RENAME COLUMN review TO review_date;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'review' 
ORDER BY ordinal_position;
