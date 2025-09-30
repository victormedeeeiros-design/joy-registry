-- Fix RSVP policies for mobile and authenticated users
-- This migration fixes the RLS policies that were preventing RSVP submissions on mobile

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create RSVP for active sites" ON public.site_rsvps;
DROP POLICY IF EXISTS "Guests can update their own RSVP" ON public.site_rsvps;

-- Recreate INSERT policy - allow anyone to create RSVP for active sites
CREATE POLICY "Allow RSVP creation for active sites" 
ON public.site_rsvps 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_rsvps.site_id 
    AND sites.is_active = true
  )
);

-- Recreate UPDATE policy - allow users to update their own RSVP by email or user_id
CREATE POLICY "Allow RSVP updates by owner" 
ON public.site_rsvps 
FOR UPDATE 
USING (
  -- Allow update if user email matches
  guest_email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
  OR 
  -- Allow update if authenticated and site_user_id matches
  (
    auth.uid() IS NOT NULL 
    AND site_user_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.site_users 
      WHERE site_users.id = site_rsvps.site_user_id 
      AND site_users.user_id = auth.uid()
    )
  )
  OR
  -- Allow update if user is the site creator
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_rsvps.site_id 
    AND sites.creator_id = auth.uid()
  )
);

-- Add policy to allow users to view their own RSVPs
CREATE POLICY "Users can view their own RSVPs" 
ON public.site_rsvps 
FOR SELECT 
USING (
  -- Allow viewing if user email matches
  guest_email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
  OR 
  -- Allow viewing if authenticated and site_user_id matches
  (
    auth.uid() IS NOT NULL 
    AND site_user_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.site_users 
      WHERE site_users.id = site_rsvps.site_user_id 
      AND site_users.user_id = auth.uid()
    )
  )
  OR
  -- Allow site creators to view RSVPs for their sites
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_rsvps.site_id 
    AND sites.creator_id = auth.uid()
  )
);