-- Fix: Ensure agency is created during signup with proper name
-- This trigger works even when email confirmation is enabled

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create function that reads agency_name from user metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  agency_name_val TEXT;
  agency_slug_val TEXT;
BEGIN
  -- Get agency name from user metadata
  agency_name_val := NEW.raw_user_meta_data->>'agency_name';
  agency_slug_val := NEW.raw_user_meta_data->>'agency_slug';
  
  -- Only create agency if name is provided and user doesn't already have one
  IF agency_name_val IS NOT NULL AND agency_name_val != '' THEN
    -- Check if user already has an agency (prevent duplicates)
    IF NOT EXISTS (
      SELECT 1 FROM agencies WHERE user_id = NEW.id
    ) THEN
      INSERT INTO agencies (
        name,
        slug,
        email,
        niche,
        verified,
        user_id
      ) VALUES (
        agency_name_val,
        COALESCE(agency_slug_val, LOWER(REGEXP_REPLACE(agency_name_val, '[^a-zA-Z0-9]+', '-', 'g'))),
        NEW.email,
        'Web3',
        false,
        NEW.id
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        user_id = EXCLUDED.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger that fires after user is inserted
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also ensure RLS allows the trigger to insert (it uses SECURITY DEFINER so it should work)
-- But let's also make sure the policy allows inserts with user_id matching
-- (This is already in fix-signup-rls-complete.sql, but ensuring it exists)
