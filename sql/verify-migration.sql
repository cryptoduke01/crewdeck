-- Verification script to check if migration worked correctly
-- Run this in Supabase SQL Editor to verify the migration

-- 1. Check if profiles table exists and has correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Check if profile_type column exists and has data
SELECT 
    profile_type, 
    COUNT(*) as count 
FROM profiles 
GROUP BY profile_type;

-- 3. Check if foreign key columns were renamed
SELECT 
    column_name 
FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'profile_id';
SELECT 
    column_name 
FROM information_schema.columns 
WHERE table_name = 'reviews' AND column_name = 'profile_id';
SELECT 
    column_name 
FROM information_schema.columns 
WHERE table_name = 'portfolio' AND column_name = 'profile_id';

-- 4. Check if new KOL columns exist
SELECT 
    column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('twitter_handle', 'twitter_followers', 'engagement_rate', 'content_types', 'price_per_thread', 'price_per_video', 'price_per_space', 'wallet_verified');

-- 5. Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND indexname LIKE 'idx_profiles%';

-- 6. Check RLS policies on profiles
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'profiles';
