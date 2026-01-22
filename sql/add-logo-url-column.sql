-- Add logo_url column to profiles table
-- This column stores the profile picture URL for KOLs or logo URL for agencies

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add comment for clarity
COMMENT ON COLUMN profiles.logo_url IS 'Profile picture URL for KOLs or logo URL for agencies';
