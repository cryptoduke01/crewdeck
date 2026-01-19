-- Create storage bucket for portfolio images
-- Run this in Supabase SQL Editor
-- IMPORTANT: You can also create the bucket via Supabase Dashboard:
-- 1. Go to Storage in left sidebar
-- 2. Click "New bucket"
-- 3. Name: portfolio-images
-- 4. Make it public: Yes
-- 5. Click "Create bucket"

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- If the above doesn't work, try creating via Dashboard first, then run the policies below

-- Allow public read access to portfolio images
CREATE POLICY "Public can view portfolio images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio-images')
WITH CHECK (bucket_id = 'portfolio-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-images');
