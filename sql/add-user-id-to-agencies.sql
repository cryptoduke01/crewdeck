-- Add user_id column to agencies table for authentication
-- This links agencies to Supabase Auth users

ALTER TABLE agencies 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agencies_user_id ON agencies(user_id);

-- Allow authenticated users to insert their own agency
CREATE POLICY "Users can insert their own agency"
ON agencies FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to update their own agency
CREATE POLICY "Agencies can update their own profile"
ON agencies FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to view their own agency (even if not verified)
CREATE POLICY "Users can view their own agency"
ON agencies FOR SELECT
TO authenticated
USING (user_id = auth.uid());
