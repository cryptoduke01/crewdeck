-- Migration: Rename agencies to profiles and add KOL support
-- Run this in Supabase SQL Editor

-- Step 1: Add new columns to agencies table first
ALTER TABLE agencies 
ADD COLUMN IF NOT EXISTS profile_type TEXT DEFAULT 'agency',
ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
ADD COLUMN IF NOT EXISTS twitter_followers INTEGER,
ADD COLUMN IF NOT EXISTS engagement_rate DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS content_types TEXT[],
ADD COLUMN IF NOT EXISTS price_per_thread INTEGER,
ADD COLUMN IF NOT EXISTS price_per_video INTEGER,
ADD COLUMN IF NOT EXISTS price_per_space INTEGER,
ADD COLUMN IF NOT EXISTS wallet_verified BOOLEAN DEFAULT FALSE;

-- Step 2: Update existing rows to have profile_type = 'agency'
UPDATE agencies SET profile_type = 'agency' WHERE profile_type IS NULL;

-- Step 3: Rename columns if they exist with different names
-- (wallet_address should already exist from previous migration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agencies' AND column_name = 'wallet_address'
  ) THEN
    ALTER TABLE agencies RENAME COLUMN wallet_address TO solana_wallet;
  END IF;
END $$;

-- Step 4: Update RLS policies before renaming table
-- Drop old policies on agencies table
DROP POLICY IF EXISTS "Public can view verified agencies" ON agencies;
DROP POLICY IF EXISTS "Agencies can update own profile" ON agencies;

-- Step 5: Rename the table
ALTER TABLE agencies RENAME TO profiles;

-- Step 6: Update indexes
DROP INDEX IF EXISTS idx_agencies_featured;
DROP INDEX IF EXISTS idx_agencies_premium;
DROP INDEX IF EXISTS idx_agencies_premium_until;

CREATE INDEX IF NOT EXISTS idx_profiles_profile_type ON profiles(profile_type);
CREATE INDEX IF NOT EXISTS idx_profiles_twitter_followers ON profiles(twitter_followers);
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_verified ON profiles(wallet_verified);

-- Step 7: Update foreign key references in other tables
-- Messages table
ALTER TABLE messages 
RENAME COLUMN agency_id TO profile_id;

-- Reviews table  
ALTER TABLE reviews
RENAME COLUMN agency_id TO profile_id;

-- Services table (if it exists separately, otherwise it's in profiles)
-- Portfolio table
ALTER TABLE portfolio
RENAME COLUMN agency_id TO profile_id;

-- Step 8: Create new RLS policies on profiles table
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
CREATE POLICY "Public can view profiles"
ON profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON profiles;
CREATE POLICY "Authenticated users can insert profiles"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update messages policies
DROP POLICY IF EXISTS "Public can send messages to verified agencies" ON messages;
DROP POLICY IF EXISTS "Public can view messages to verified agencies" ON messages;
DROP POLICY IF EXISTS "Public can send messages to profiles" ON messages;
DROP POLICY IF EXISTS "Public can view messages" ON messages;

CREATE POLICY "Public can send messages to profiles"
ON messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can view messages"
ON messages FOR SELECT
USING (true);

-- Update reviews policies  
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
DROP POLICY IF EXISTS "Public can create reviews" ON reviews;

CREATE POLICY "Public can view reviews"
ON reviews FOR SELECT
USING (true);

CREATE POLICY "Public can create reviews"
ON reviews FOR INSERT
WITH CHECK (true);
