-- Fix services table to use profile_id instead of agency_id
-- This should be run after migrate-to-profiles.sql

-- Step 1: Rename the column in services table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'agency_id'
  ) THEN
    ALTER TABLE services RENAME COLUMN agency_id TO profile_id;
  END IF;
END $$;

-- Step 2: Drop old RLS policies that reference agency_id
DROP POLICY IF EXISTS "Agencies can insert their own services" ON services;
DROP POLICY IF EXISTS "Agencies can update their own services" ON services;
DROP POLICY IF EXISTS "Agencies can delete their own services" ON services;
DROP POLICY IF EXISTS "Agencies can view their own services" ON services;
DROP POLICY IF EXISTS "Public can view services of verified agencies" ON services;

-- Step 3: Create new RLS policies using profile_id
-- Allow profiles to insert their own services
CREATE POLICY "Profiles can insert their own services"
ON services FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = services.profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- Allow profiles to update their own services
CREATE POLICY "Profiles can update their own services"
ON services FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = services.profile_id
    AND profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = services.profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- Allow profiles to delete their own services
CREATE POLICY "Profiles can delete their own services"
ON services FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = services.profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- Allow profiles to view their own services (even if not verified)
CREATE POLICY "Profiles can view their own services"
ON services FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = services.profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- Allow public to view services of verified profiles
CREATE POLICY "Public can view services of verified profiles"
ON services FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = services.profile_id 
    AND profiles.verified = true
  )
);
