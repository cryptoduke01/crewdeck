-- Add read status column to messages table
-- Run this in Supabase SQL Editor

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);

-- Update RLS policy to allow agencies to update their messages
DROP POLICY IF EXISTS "Agencies can update their messages" ON messages;

CREATE POLICY "Agencies can update their messages"
ON messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = messages.agency_id
    AND agencies.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = messages.agency_id
    AND agencies.user_id = auth.uid()
  )
);

-- Allow agencies to delete their messages
DROP POLICY IF EXISTS "Agencies can delete their messages" ON messages;

CREATE POLICY "Agencies can delete their messages"
ON messages FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = messages.agency_id
    AND agencies.user_id = auth.uid()
  )
);
