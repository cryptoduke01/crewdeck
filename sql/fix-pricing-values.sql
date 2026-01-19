-- Fix pricing values that are too large
-- If your prices show as "$5000K" instead of "$5K", run this to fix them

-- Step 1: Check current pricing values
SELECT 
  id,
  name,
  price_range_min,
  price_range_max,
  price_range_min / 1000 as min_in_k,
  price_range_max / 1000 as max_in_k
FROM agencies
WHERE price_range_min IS NOT NULL OR price_range_max IS NOT NULL;

-- Step 2: Fix values that are too large (if they're > 1000, they're probably wrong)
-- This assumes values > 1000 should be divided by 1000
-- For example: 5000000 becomes 5000, 10000000 becomes 10000

UPDATE agencies
SET 
  price_range_min = CASE 
    WHEN price_range_min > 1000 THEN price_range_min / 1000
    ELSE price_range_min
  END,
  price_range_max = CASE 
    WHEN price_range_max > 1000 THEN price_range_max / 1000
    ELSE price_range_max
  END
WHERE price_range_min > 1000 OR price_range_max > 1000;

-- Step 3: Verify the fix
SELECT 
  id,
  name,
  price_range_min,
  price_range_max,
  price_range_min / 1000 as min_display,
  price_range_max / 1000 as max_display
FROM agencies
WHERE price_range_min IS NOT NULL OR price_range_max IS NOT NULL;
