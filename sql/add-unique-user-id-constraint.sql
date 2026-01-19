  -- Add unique constraint on user_id to prevent multiple agencies per user
  -- IMPORTANT: Run cleanup-duplicate-agencies-by-user.sql FIRST if you have duplicates!

  -- First, check for any duplicate user_ids
  SELECT 
    user_id, 
    COUNT(*) as count,
    array_agg(id ORDER BY created_at DESC) as agency_ids,
    array_agg(name ORDER BY created_at DESC) as agency_names
  FROM agencies
  WHERE user_id IS NOT NULL
  GROUP BY user_id
  HAVING COUNT(*) > 1;

  -- If duplicates exist, run cleanup-duplicate-agencies-by-user.sql first!

  -- Create unique index to prevent duplicates going forward
  -- This will fail if duplicates still exist - clean them up first
  CREATE UNIQUE INDEX IF NOT EXISTS idx_agencies_unique_user_id 
  ON agencies(user_id) 
  WHERE user_id IS NOT NULL;
