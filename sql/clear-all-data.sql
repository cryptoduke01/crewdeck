-- WARNING: This will delete ALL data from the database
-- Use with caution! This is a complete reset.
--
-- ⚠️ IMPORTANT: This script clears database tables but NOT auth users.
-- You MUST also clear auth.users separately, otherwise signup will fail
-- with "User already registered" error.
--
-- For a complete reset including auth users, use: sql/clear-everything.sql
-- OR run this script, then run: sql/clear-auth-users.sql

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Delete all data (in reverse order of dependencies)
DELETE FROM messages;
DELETE FROM reviews;
DELETE FROM portfolio;
DELETE FROM services;
DELETE FROM agencies;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Verify deletion
SELECT 
  (SELECT COUNT(*) FROM agencies) as agencies_count,
  (SELECT COUNT(*) FROM services) as services_count,
  (SELECT COUNT(*) FROM portfolio) as portfolio_count,
  (SELECT COUNT(*) FROM reviews) as reviews_count,
  (SELECT COUNT(*) FROM messages) as messages_count;

-- ⚠️ REMEMBER: Also delete auth users!
-- Run this separately (or use the master script: sql/clear-everything.sql):
-- DELETE FROM auth.users;
