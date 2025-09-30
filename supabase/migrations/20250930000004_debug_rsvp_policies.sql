-- Debug RSVP issues - Check and fix site_users and RSVP relationships
-- This script helps debug RSVP submission issues

-- Check if site_users table has proper structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'site_users' 
ORDER BY ordinal_position;

-- Check if site_rsvps table has proper structure  
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'site_rsvps' 
ORDER BY ordinal_position;

-- Check current RLS policies for site_rsvps
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'site_rsvps';

-- Check current RLS policies for site_users
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'site_users';

-- Add policy to allow authenticated users to view site_users they belong to
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'site_users' 
    AND policyname = 'Users can view their site_user records'
  ) THEN
    CREATE POLICY "Users can view their site_user records" 
    ON public.site_users 
    FOR SELECT 
    USING (user_id = auth.uid());
  END IF;
END $$;

-- Ensure site_rsvps can reference site_users properly
DROP POLICY IF EXISTS "Allow RSVP updates by owner" ON public.site_rsvps;

CREATE POLICY "Allow RSVP updates by owner" 
ON public.site_rsvps 
FOR UPDATE 
USING (
  -- Allow update if user email matches
  guest_email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
  OR 
  -- Allow update if authenticated and owns the site_user record
  (
    auth.uid() IS NOT NULL 
    AND site_user_id IN (
      SELECT id FROM public.site_users WHERE user_id = auth.uid()
    )
  )
  OR
  -- Allow update if user is the site creator
  site_id IN (
    SELECT id FROM public.sites WHERE creator_id = auth.uid()
  )
);

-- Test query to check if a user can see their RSVP data
-- SELECT * FROM site_rsvps WHERE guest_email = 'user@example.com';