-- Add monetization fields to agencies table
-- Run this in Supabase SQL Editor

ALTER TABLE agencies 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE;

-- Create index for featured agencies (for faster queries)
CREATE INDEX IF NOT EXISTS idx_agencies_featured ON agencies(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_agencies_premium ON agencies(premium) WHERE premium = true;

-- Update RLS policies to allow agencies to update their own featured/premium status
-- (In practice, this should be done through admin panel or payment system)

-- Allow public to see featured/premium status
-- (Already covered by existing SELECT policies)
