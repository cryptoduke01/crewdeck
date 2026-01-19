-- Fix: Ensure users can view their own agency in dashboard
-- This policy allows authenticated users to see their own agency even if it's not verified

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own agency" ON agencies;

-- Create the SELECT policy for users to view their own agency
-- This works alongside the "Public can view verified agencies" policy
CREATE POLICY "Users can view their own agency"
ON agencies FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Also ensure the user_id column exists and has an index
ALTER TABLE agencies 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_agencies_user_id ON agencies(user_id);

-- If you have existing agencies without user_id, you can update them manually:
-- UPDATE agencies SET user_id = 'YOUR_USER_ID' WHERE id = 'AGENCY_ID';
