-- Allow public to insert reviews (for review submission form)
CREATE POLICY "Public can submit reviews"
ON reviews FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agencies 
    WHERE agencies.id = reviews.agency_id 
    AND agencies.verified = true
  )
);

-- Allow agencies to view all reviews for their own agency
CREATE POLICY "Agencies can view their reviews"
ON reviews FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = reviews.agency_id
    AND agencies.user_id = auth.uid()
  )
);
