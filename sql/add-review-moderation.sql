-- Add moderation columns to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT true;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS flagged_reason TEXT;

-- Add index for unapproved reviews
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved) WHERE approved = false;

-- Update RLS policy to only show approved reviews
DROP POLICY IF EXISTS "Public can view reviews of verified agencies" ON reviews;

CREATE POLICY "Public can view approved reviews of verified agencies"
ON reviews FOR SELECT
USING (
  approved = true AND
  EXISTS (
    SELECT 1 FROM agencies 
    WHERE agencies.id = reviews.agency_id 
    AND agencies.verified = true
  )
);

-- Drop existing policy if it exists, then recreate
DROP POLICY IF EXISTS "Agencies can view their own reviews" ON reviews;

-- Allow agencies to view all their reviews (including unapproved)
CREATE POLICY "Agencies can view their own reviews"
ON reviews FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = reviews.agency_id
    AND agencies.user_id = auth.uid()
  )
);

-- Allow admin to update review approval status
-- (This would require admin role check - implement via service role or admin table)
