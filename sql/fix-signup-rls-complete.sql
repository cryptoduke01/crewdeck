-- Complete fix for signup RLS issues
-- Run this SQL to fix agency insertion during signup

-- Step 1: Ensure user_id column exists
ALTER TABLE agencies 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index
CREATE INDEX IF NOT EXISTS idx_agencies_user_id ON agencies(user_id);

-- Step 3: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert their own agency" ON agencies;
DROP POLICY IF EXISTS "Agencies can update their own profile" ON agencies;
DROP POLICY IF EXISTS "Users can view their own agency" ON agencies;

-- Step 4: Create INSERT policy (this is the critical one for signup)
CREATE POLICY "Users can insert their own agency"
ON agencies FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Step 5: Create UPDATE policy
CREATE POLICY "Agencies can update their own profile"
ON agencies FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Step 6: Create SELECT policy (so users can see their own unverified agency)
CREATE POLICY "Users can view their own agency"
ON agencies FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Note: If email confirmation is enabled in Supabase, the user won't be authenticated
-- immediately after signup. You have two options:
-- 1. Disable email confirmation in Supabase Auth settings (for development)
-- 2. Use a database trigger to create the agency when the user is confirmed
