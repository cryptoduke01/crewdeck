-- Create a database function to handle agency creation during signup
-- This allows inserting agency records even when the user isn't fully authenticated yet
-- The function uses SECURITY DEFINER to bypass RLS temporarily

CREATE OR REPLACE FUNCTION create_agency_on_signup(
  agency_name TEXT,
  agency_slug TEXT,
  agency_email TEXT,
  user_id_param UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  agency_id UUID;
BEGIN
  INSERT INTO agencies (
    name,
    slug,
    email,
    niche,
    verified,
    user_id
  ) VALUES (
    agency_name,
    agency_slug,
    agency_email,
    'Web3', -- Default niche
    false,
    user_id_param
  )
  RETURNING id INTO agency_id;
  
  RETURN agency_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_agency_on_signup TO authenticated;

-- Alternative: If the function approach doesn't work, just ensure the RLS policy exists
-- Make sure you've run the INSERT policy from fix-agency-insert-policy.sql first
