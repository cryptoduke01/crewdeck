-- Fix: Allow agencies to manage their own services
-- This allows authenticated users to INSERT, UPDATE, and DELETE services for their own agency

-- Allow agencies to insert services for their own agency
CREATE POLICY "Agencies can insert their own services"
ON services FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = services.agency_id
    AND agencies.user_id = auth.uid()
  )
);

-- Allow agencies to update services for their own agency
CREATE POLICY "Agencies can update their own services"
ON services FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = services.agency_id
    AND agencies.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = services.agency_id
    AND agencies.user_id = auth.uid()
  )
);

-- Allow agencies to delete services for their own agency
CREATE POLICY "Agencies can delete their own services"
ON services FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = services.agency_id
    AND agencies.user_id = auth.uid()
  )
);

-- Also allow agencies to view their own services (even if not verified)
CREATE POLICY "Agencies can view their own services"
ON services FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = services.agency_id
    AND agencies.user_id = auth.uid()
  )
);
