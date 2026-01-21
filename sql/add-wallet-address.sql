-- Add wallet_address column to agencies table
ALTER TABLE agencies
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agencies_wallet_address ON agencies(wallet_address) WHERE wallet_address IS NOT NULL;
