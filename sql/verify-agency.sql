-- Verify an agency (make it visible in public listings)
-- Replace 'YOUR_AGENCY_ID' with the actual agency ID from your database

-- Option 1: Verify a specific agency by ID
UPDATE agencies
SET verified = true
WHERE id = 'YOUR_AGENCY_ID';

-- Option 2: Verify all agencies (for development/testing only!)
-- WARNING: This verifies ALL agencies. Use with caution!
-- UPDATE agencies SET verified = true;

-- Option 3: Verify agencies for a specific user (by email)
-- UPDATE agencies
-- SET verified = true
-- WHERE email = 'your@email.com';

-- After running this, your agency will appear in the browse page
