-- Fix signup validation to check only email, not agency name/slug
-- This ensures that multiple agencies can have the same name, but emails must be unique per user

-- Update the trigger to check email uniqueness, not slug conflicts
-- The trigger should only check if the user already has an agency, not if the email exists elsewhere
-- (Email uniqueness is handled by Supabase Auth)

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function that only checks user_id (not email or slug conflicts)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  agency_name_val TEXT;
  agency_slug_val TEXT;
  unique_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  -- Get agency name from user metadata
  agency_name_val := NEW.raw_user_meta_data->>'agency_name';
  agency_slug_val := NEW.raw_user_meta_data->>'agency_slug';
  
  -- Only create agency if name is provided and user doesn't already have one
  IF agency_name_val IS NOT NULL AND agency_name_val != '' THEN
    -- Check if user already has an agency (prevent duplicates by user_id only)
    IF NOT EXISTS (
      SELECT 1 FROM agencies WHERE user_id = NEW.id
    ) THEN
      -- Make slug unique by appending user ID if needed
      unique_slug := COALESCE(agency_slug_val, LOWER(REGEXP_REPLACE(agency_name_val, '[^a-zA-Z0-9]+', '-', 'g')));
      
      -- Check if slug exists (for a different user)
      SELECT EXISTS(SELECT 1 FROM agencies WHERE slug = unique_slug) INTO slug_exists;
      
      -- If slug exists, append user ID to make it unique
      IF slug_exists THEN
        unique_slug := unique_slug || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
      END IF;
      
      INSERT INTO agencies (
        name,
        slug,
        email,
        niche,
        verified,
        user_id
      ) VALUES (
        agency_name_val,
        unique_slug,
        NEW.email,
        'Web3',
        false,
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger that fires after user is inserted
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
