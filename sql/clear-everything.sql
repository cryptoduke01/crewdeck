-- MASTER SCRIPT: Clear ALL data including auth users
-- WARNING: This will delete EVERYTHING - use with extreme caution!
-- This is a complete reset of the entire database and auth system.

-- Step 1: Clear all database tables
SET session_replication_role = 'replica';

DELETE FROM messages;
DELETE FROM reviews;
DELETE FROM portfolio;
DELETE FROM services;
DELETE FROM agencies;

SET session_replication_role = 'origin';

-- Step 2: Clear all auth users
-- This is critical! If you don't clear auth.users, signup will fail
-- with "User already registered" error even for new emails.
DELETE FROM auth.users;

-- Step 3: Verify everything is cleared
SELECT 
  (SELECT COUNT(*) FROM agencies) as agencies_count,
  (SELECT COUNT(*) FROM services) as services_count,
  (SELECT COUNT(*) FROM portfolio) as portfolio_count,
  (SELECT COUNT(*) FROM reviews) as reviews_count,
  (SELECT COUNT(*) FROM messages) as messages_count,
  (SELECT COUNT(*) FROM auth.users) as auth_users_count;

-- Expected result: All counts should be 0
