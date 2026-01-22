-- Fix portfolio table to use profile_id instead of agency_id
-- This should have been done in migrate-to-profiles.sql, but running it again to ensure it's correct

-- Check if agency_id column exists and rename it to profile_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'portfolio' AND column_name = 'agency_id'
  ) THEN
    ALTER TABLE portfolio RENAME COLUMN agency_id TO profile_id;
  END IF;
END $$;

-- Update foreign key constraint if it exists
DO $$
BEGIN
  -- Drop old foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'portfolio_agency_id_fkey' 
    AND table_name = 'portfolio'
  ) THEN
    ALTER TABLE portfolio DROP CONSTRAINT portfolio_agency_id_fkey;
  END IF;
  
  -- Add new foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'portfolio_profile_id_fkey' 
    AND table_name = 'portfolio'
  ) THEN
    ALTER TABLE portfolio 
    ADD CONSTRAINT portfolio_profile_id_fkey 
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update RLS policies to use profile_id
DROP POLICY IF EXISTS "Public can view portfolio of verified agencies" ON portfolio;
CREATE POLICY "Public can view portfolio of verified profiles"
ON portfolio FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = portfolio.profile_id 
    AND profiles.verified = true
  )
);

-- Allow authenticated users to manage their own portfolio
DROP POLICY IF EXISTS "Agencies can manage their own portfolio" ON portfolio;
CREATE POLICY "Users can manage their own portfolio"
ON portfolio FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = portfolio.profile_id
    AND profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = portfolio.profile_id
    AND profiles.user_id = auth.uid()
  )
);
