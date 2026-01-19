-- Fix user_id for your agency after cleanup
-- Run this AFTER you've cleaned up duplicates

-- Step 1: Get your user ID from auth.users
SELECT id, email FROM auth.users ORDER BY created_at DESC;

-- Step 2: Get your agency ID
SELECT id, name, user_id, email FROM agencies WHERE name = 'Netrovert HQ';

-- Step 3: Update the agency with your user_id
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from Step 1
-- Replace 'YOUR_AGENCY_ID_HERE' with your agency ID from Step 2
UPDATE agencies 
SET user_id = 'YOUR_USER_ID_HERE'
WHERE id = 'YOUR_AGENCY_ID_HERE';

-- Step 4: Verify it worked
SELECT id, name, user_id, verified FROM agencies WHERE id = 'YOUR_AGENCY_ID_HERE';
