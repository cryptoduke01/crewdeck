-- Create a database trigger to automatically create agency record when user signs up
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
  -- Check if user already has an agency (prevent duplicates)
  IF NOT EXISTS (
    SELECT 1 FROM agencies WHERE user_id = NEW.id
  ) THEN
    -- Create a default agency record (user can update later)
    -- We'll need to get the agency name from somewhere else
    -- For now, this is a placeholder - you'll need to store agency_name during signup
    -- One option: store in user metadata during signup, then read here
    INSERT INTO agencies (
      name,
      slug,
      email,
      niche,
      verified,
      user_id
    ) VALUES (
      COALESCE(NEW.raw_user_meta_data->>'agency_name', 'New Agency'),
      COALESCE(NEW.raw_user_meta_data->>'agency_slug', 'new-agency-' || substr(NEW.id::text, 1, 8)),
      NEW.email,
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

-- Note: This approach requires passing agency_name in user metadata during signup
-- Update the signup code to include: data: { agency_name: agencyName, agency_slug: slug }
