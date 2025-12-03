-- Create a function to list all user emails and signup dates
-- This function uses SECURITY DEFINER to allow admins to query auth.users
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  email text,
  created_at timestamptz,
  email_verified boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.email::text,
    au.created_at,
    au.email_confirmed_at IS NOT NULL as email_verified
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
-- (The admin check will be done in the application layer)
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;

