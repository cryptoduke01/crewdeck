-- Delete a specific agency by ID
-- Replace 'AGENCY_ID_HERE' with the actual agency ID you want to delete

-- First, see all agencies to find the ID
SELECT 
  id,
  name,
  slug,
  user_id,
  verified,
  created_at
FROM agencies
ORDER BY created_at DESC;

-- Uncomment and replace AGENCY_ID_HERE with the actual ID to delete
-- DELETE FROM agencies WHERE id = 'AGENCY_ID_HERE';

-- Or delete multiple agencies by ID
-- DELETE FROM agencies WHERE id IN ('id1', 'id2', 'id3');

-- Or delete agencies by name pattern (be careful!)
-- DELETE FROM agencies WHERE name LIKE '%Mock%' OR name LIKE '%Test%';
