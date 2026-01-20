-- Clear auth users from Supabase
-- WARNING: This will delete users from Supabase Auth
-- 
-- IMPORTANT: If you cleared agencies but not auth users, signup will fail
-- with "User already registered" error. Always clear both!
--
-- For a complete reset, use: sql/clear-everything.sql

-- Option 1: Delete all users (recommended for fresh start)
DELETE FROM auth.users;

-- Option 2: Delete only unconfirmed users (users who haven't verified email)
-- DELETE FROM auth.users WHERE email_confirmed_at IS NULL;

-- Option 3: Delete specific user by email
-- DELETE FROM auth.users WHERE email = 'your-email@example.com';

-- Verify deletion
SELECT COUNT(*) as total_users FROM auth.users;

-- Note: After deleting users, you may also want to clear the agencies table
-- since agencies are linked to users via user_id
-- For complete reset, run: sql/clear-all-data.sql first, then this script
