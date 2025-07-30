-- Add thumbnail_url field to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Update existing posts with null thumbnail_url (optional)
UPDATE posts SET thumbnail_url = NULL WHERE thumbnail_url IS NULL;
