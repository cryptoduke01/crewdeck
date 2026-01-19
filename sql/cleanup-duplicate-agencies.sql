-- Cleanup duplicate agencies
-- This will help you identify and delete duplicate agencies

-- Step 1: See all your agencies and their details
SELECT 
  id,
  name,
  user_id,
  verified,
  created_at,
  email
FROM agencies
ORDER BY created_at DESC;

-- Step 2: Identify duplicates by name (see which ones are duplicates)
SELECT 
  name,
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as agency_ids
FROM agencies
GROUP BY name
HAVING COUNT(*) > 1;

-- Step 3: Delete duplicates (KEEP THE MOST RECENT ONE)
-- This keeps the agency with the latest created_at and deletes older duplicates
-- BE CAREFUL - Review the results from Step 1 and Step 2 first!

-- Option A: Delete duplicates by name, keeping only the most recent one
DELETE FROM agencies
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at DESC) as rn
    FROM agencies
  ) t
  WHERE t.rn > 1  -- Keep only the first (most recent) one
);

-- Option B: If you want to keep a specific agency by ID, delete all others with the same name
-- Replace 'KEEP_THIS_AGENCY_ID' with the ID you want to keep
/*
DELETE FROM agencies
WHERE name = 'Netrovert HQ'
AND id != 'KEEP_THIS_AGENCY_ID';
*/

-- Step 4: After cleanup, verify you only have one
SELECT id, name, user_id, verified, created_at FROM agencies WHERE name = 'Netrovert HQ';
