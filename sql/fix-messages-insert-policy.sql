-- Fix: Ensure public can send messages to verified agencies
-- This allows anyone to submit contact forms

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can send messages" ON messages;

-- Create policy that allows public to insert messages for verified agencies
CREATE POLICY "Public can send messages to verified agencies"
ON messages FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agencies 
    WHERE agencies.id = messages.agency_id 
    AND agencies.verified = true
  )
);

-- Also allow authenticated users to send messages (in case they're logged in)
DROP POLICY IF EXISTS "Authenticated users can send messages" ON messages;
CREATE POLICY "Authenticated users can send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (true);
