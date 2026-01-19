-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to verified agencies
CREATE POLICY "Public can view verified agencies"
ON agencies FOR SELECT
USING (verified = true);

-- Allow public read access to services of verified agencies
CREATE POLICY "Public can view services of verified agencies"
ON services FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agencies 
    WHERE agencies.id = services.agency_id 
    AND agencies.verified = true
  )
);

-- Allow public read access to portfolio of verified agencies
CREATE POLICY "Public can view portfolio of verified agencies"
ON portfolio FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agencies 
    WHERE agencies.id = portfolio.agency_id 
    AND agencies.verified = true
  )
);

-- Allow public read access to reviews of verified agencies
CREATE POLICY "Public can view reviews of verified agencies"
ON reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agencies 
    WHERE agencies.id = reviews.agency_id 
    AND agencies.verified = true
  )
);

-- Allow anyone to insert messages (for public contact forms)
CREATE POLICY "Public can send messages"
ON messages FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated agencies to view their messages
CREATE POLICY "Agencies can view their messages"
ON messages FOR SELECT
TO authenticated
USING (true);

-- Allow agencies to manage their own services
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
