-- Drop the existing function first (since we're changing the return type)
DROP FUNCTION IF EXISTS get_all_users();

-- Recreate get_all_users to include user ID
CREATE FUNCTION get_all_users()
RETURNS TABLE (
  id uuid,
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
    au.id,
    au.email::text,
    au.created_at,
    au.email_confirmed_at IS NOT NULL as email_verified
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;

-- Create a function to delete a user by email
CREATE OR REPLACE FUNCTION delete_user_by_email(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_to_delete uuid;
BEGIN
  -- Find the user ID by email
  SELECT id INTO user_id_to_delete
  FROM auth.users
  WHERE email = user_email;
  
  -- If user not found, return false
  IF user_id_to_delete IS NULL THEN
    RETURN false;
  END IF;
  
  -- Delete the user from auth.users
  -- This will cascade delete related records in auth schema
  DELETE FROM auth.users WHERE id = user_id_to_delete;
  
  RETURN true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_by_email(text) TO authenticated;

