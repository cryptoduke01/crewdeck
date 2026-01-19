-- Clean up duplicate agencies for the same user_id
-- Keeps the most recent agency (by created_at) and deletes older duplicates

-- First, see what duplicates exist
SELECT 
  user_id, 
  COUNT(*) as count,
  array_agg(id ORDER BY created_at DESC) as agency_ids,
  array_agg(name ORDER BY created_at DESC) as agency_names,
  array_agg(created_at ORDER BY created_at DESC) as created_dates
FROM agencies
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Delete duplicate agencies, keeping only the most recent one per user
-- This uses a subquery to identify which agencies to keep (the most recent one)
DELETE FROM agencies
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM agencies
    WHERE user_id IS NOT NULL
  ) t
  WHERE rn > 1
);

-- Verify cleanup - should show 0 duplicates
SELECT 
  user_id, 
  COUNT(*) as count
FROM agencies
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Now create the unique index (should work after cleanup)
CREATE UNIQUE INDEX IF NOT EXISTS idx_agencies_unique_user_id 
ON agencies(user_id) 
WHERE user_id IS NOT NULL;

-- Final verification
SELECT 
  COUNT(*) as total_agencies,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) - COUNT(DISTINCT user_id) as duplicates
FROM agencies
WHERE user_id IS NOT NULL;
