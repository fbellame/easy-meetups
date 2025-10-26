-- Add bio and social_links fields to hosts table
ALTER TABLE hosts 
ADD COLUMN bio TEXT,
ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
