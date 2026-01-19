-- Complete solution: Clean duplicates AND add unique constraint in one script

-- Step 1: Show duplicates first (for reference)
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

-- Step 2: Delete duplicate agencies, keeping only the most recent one per user
-- This deletes all agencies except the one with the latest created_at for each user_id
DELETE FROM agencies
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      user_id,
      created_at,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM agencies
    WHERE user_id IS NOT NULL
  ) t
  WHERE rn > 1
);

-- Step 3: Verify no duplicates remain
SELECT 
  user_id, 
  COUNT(*) as count
FROM agencies
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1;
-- Should return 0 rows

-- Step 4: Drop the index if it exists (in case of previous failed attempts)
DROP INDEX IF EXISTS idx_agencies_unique_user_id;

-- Step 5: Create unique index (should work now)
CREATE UNIQUE INDEX idx_agencies_unique_user_id 
ON agencies(user_id) 
WHERE user_id IS NOT NULL;

-- Step 6: Final verification
SELECT 
  COUNT(*) as total_agencies,
  COUNT(DISTINCT user_id) as unique_users,
  CASE 
    WHEN COUNT(*) = COUNT(DISTINCT user_id) THEN 'No duplicates ✓'
    ELSE 'WARNING: Duplicates still exist!'
  END as status
FROM agencies
WHERE user_id IS NOT NULL;
