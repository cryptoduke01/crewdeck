-- Add featured column to agencies table
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add index for featured agencies
CREATE INDEX IF NOT EXISTS idx_agencies_featured ON agencies(featured) WHERE featured = true;

-- Drop existing policy if it exists, then recreate
DROP POLICY IF EXISTS "Public can view featured agencies" ON agencies;

-- Add RLS policy for viewing featured agencies
CREATE POLICY "Public can view featured agencies"
ON agencies FOR SELECT
USING (featured = true OR verified = true);
