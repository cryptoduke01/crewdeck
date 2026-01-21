-- Create a database trigger to automatically create profile record when user signs up
-- This works even when email confirmation is enabled
-- The trigger runs server-side and can bypass RLS

-- First, create a function that will be called by the trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user already has a profile (prevent duplicates)
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = NEW.id
  ) THEN
    -- Create a default profile record (user can update later)
    -- We'll get the profile name and type from user metadata during signup
    INSERT INTO profiles (
      name,
      slug,
      email,
      profile_type,
      niche,
      verified,
      user_id
    ) VALUES (
      COALESCE(NEW.raw_user_meta_data->>'profile_name', 'New Profile'),
      COALESCE(NEW.raw_user_meta_data->>'profile_slug', 'new-profile-' || substr(NEW.id::text, 1, 8)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'profile_type', 'agency'),
      'Web3',
      false,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger that fires after user is inserted
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Note: This approach requires passing profile_name, profile_slug, and profile_type in user metadata during signup
-- Update the signup code to include: 
-- data: { profile_name: profileName, profile_slug: slug, profile_type: profileType }
