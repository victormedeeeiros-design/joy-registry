-- Final fix for RSVP issues - Comprehensive RLS policy update
-- Execute this migration to resolve all RSVP permission problems

-- First, drop all existing policies for site_rsvps
DROP POLICY IF EXISTS "Anyone can create RSVP for active sites" ON public.site_rsvps;
DROP POLICY IF EXISTS "Allow RSVP creation for active sites" ON public.site_rsvps;
DROP POLICY IF EXISTS "Site creators can view RSVPs for their sites" ON public.site_rsvps;
DROP POLICY IF EXISTS "Guests can update their own RSVP" ON public.site_rsvps;
DROP POLICY IF EXISTS "Allow RSVP updates by owner" ON public.site_rsvps;
DROP POLICY IF EXISTS "Users can view their own RSVPs" ON public.site_rsvps;

-- Create comprehensive INSERT policy
CREATE POLICY "Enable RSVP insert for active sites" 
ON public.site_rsvps 
FOR INSERT 
WITH CHECK (
  -- Allow if site exists and is active
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_rsvps.site_id 
    AND sites.is_active = true
  )
);

-- Create comprehensive SELECT policy
CREATE POLICY "Enable RSVP select for owners and creators" 
ON public.site_rsvps 
FOR SELECT 
USING (
  -- Site creators can view all RSVPs for their sites
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_rsvps.site_id 
    AND sites.creator_id = auth.uid()
  )
  OR
  -- Users can view RSVPs where they are the guest (by email)
  guest_email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
  OR
  -- Users can view RSVPs where they are linked via site_users
  (
    auth.uid() IS NOT NULL 
    AND site_user_id IN (
      SELECT id FROM public.site_users 
      WHERE user_id = auth.uid()
    )
  )
);

-- Create comprehensive UPDATE policy
CREATE POLICY "Enable RSVP update for owners" 
ON public.site_rsvps 
FOR UPDATE 
USING (
  -- Users can update RSVPs where they are the guest (by email)
  guest_email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
  OR
  -- Users can update RSVPs where they are linked via site_users
  (
    auth.uid() IS NOT NULL 
    AND site_user_id IN (
      SELECT id FROM public.site_users 
      WHERE user_id = auth.uid()
    )
  )
  OR
  -- Site creators can update all RSVPs for their sites
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_rsvps.site_id 
    AND sites.creator_id = auth.uid()
  )
);

-- Create DELETE policy (for completeness)
CREATE POLICY "Enable RSVP delete for owners and creators" 
ON public.site_rsvps 
FOR DELETE 
USING (
  -- Users can delete their own RSVPs (by email)
  guest_email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
  OR
  -- Users can delete RSVPs where they are linked via site_users
  (
    auth.uid() IS NOT NULL 
    AND site_user_id IN (
      SELECT id FROM public.site_users 
      WHERE user_id = auth.uid()
    )
  )
  OR
  -- Site creators can delete all RSVPs for their sites
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_rsvps.site_id 
    AND sites.creator_id = auth.uid()
  )
);

-- Ensure site_users policies are in place for proper relationships
DROP POLICY IF EXISTS "Users can view their site_user records" ON public.site_users;
CREATE POLICY "Users can view their site_user records" 
ON public.site_users 
FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Site creators can view their site users" ON public.site_users;
CREATE POLICY "Site creators can view their site users" 
ON public.site_users 
FOR SELECT 
USING (
  site_id IN (
    SELECT id FROM public.sites 
    WHERE creator_id = auth.uid()
  )
);

-- Test the policies with a sample query (uncomment to test)
-- SELECT 'RSVP policies updated successfully' as status;