-- Keep only agencies created by authenticated users (via the site)
-- This will delete mock/test data but keep real user-created agencies

-- First, let's see what we have
SELECT 
  id,
  name,
  slug,
  user_id,
  verified,
  created_at,
  CASE 
    WHEN user_id IS NULL THEN 'Mock/Test Data'
    ELSE 'User Created'
  END as source
FROM agencies
ORDER BY created_at DESC;

-- Delete only agencies without a user_id (mock/test data)
-- These are agencies that weren't created through the signup flow
DELETE FROM agencies 
WHERE user_id IS NULL;

-- Also delete related data for those agencies
-- (This will cascade if foreign keys are set up, but being explicit)
DELETE FROM services 
WHERE agency_id NOT IN (SELECT id FROM agencies);

DELETE FROM portfolio 
WHERE agency_id NOT IN (SELECT id FROM agencies);

DELETE FROM reviews 
WHERE agency_id NOT IN (SELECT id FROM agencies);

DELETE FROM messages 
WHERE agency_id NOT IN (SELECT id FROM agencies);

-- Verify what's left
SELECT 
  COUNT(*) as remaining_agencies,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as user_created,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as without_user_id
FROM agencies;

-- Show remaining agencies
SELECT 
  id,
  name,
  slug,
  user_id,
  verified,
  created_at
FROM agencies
ORDER BY created_at DESC;
