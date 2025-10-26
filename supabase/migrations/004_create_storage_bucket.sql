-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create RLS policies for the storage bucket
CREATE POLICY "Allow public read access to event images" ON storage.objects
FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Allow authenticated users to upload event images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to update their event images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete their event images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);
