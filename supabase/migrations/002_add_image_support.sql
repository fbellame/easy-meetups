-- Add image fields to events table
ALTER TABLE events 
ADD COLUMN event_image_url TEXT,
ADD COLUMN event_banner_url TEXT,
ADD COLUMN speaker_photos JSONB DEFAULT '[]'::jsonb;

-- Add image field to speakers table for profile photos
ALTER TABLE speakers 
ADD COLUMN profile_photo_url TEXT;

-- Add image field to hosts table for profile photos  
ALTER TABLE hosts 
ADD COLUMN profile_photo_url TEXT;
