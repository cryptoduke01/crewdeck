-- Delete all auth users (for development/testing only!)
-- WARNING: This will delete ALL users from Supabase Auth
-- Run this in Supabase SQL Editor if you need to clean up test users

-- Note: You can also delete users from the Supabase Dashboard:
-- Go to Authentication > Users > Select user > Delete

-- This SQL deletes all auth users (use with caution!)
DELETE FROM auth.users;

-- If you want to delete a specific user by email:
-- DELETE FROM auth.users WHERE email = 'user@example.com';

-- After deleting auth users, you may also want to clean up related data:
-- DELETE FROM agencies;
-- DELETE FROM messages;
-- DELETE FROM reviews;
-- DELETE FROM portfolio;
-- DELETE FROM services;
