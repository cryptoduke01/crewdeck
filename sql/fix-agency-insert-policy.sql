-- Fix: Allow authenticated users to insert their own agency
-- Run this SQL in Supabase SQL Editor if you're getting RLS errors on signup

-- Allow authenticated users to insert their own agency
CREATE POLICY "Users can insert their own agency"
ON agencies FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Also fix the UPDATE policy to be simpler
DROP POLICY IF EXISTS "Agencies can update their own profile" ON agencies;
CREATE POLICY "Agencies can update their own profile"
ON agencies FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
