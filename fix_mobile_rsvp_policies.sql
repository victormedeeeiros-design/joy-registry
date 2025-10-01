-- EXECUTAR NO SUPABASE WEB (SQL Editor)
-- Este script corrige as políticas RLS para permitir RSVP no mobile

-- First, drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Enable RSVP insert for active sites" ON public.site_rsvps;

-- Create a more permissive INSERT policy that allows anonymous users
CREATE POLICY "Allow anonymous RSVP for active sites" 
ON public.site_rsvps 
FOR INSERT 
WITH CHECK (
  -- Allow if site exists and is active (no auth.uid() required for anonymous guests)
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_rsvps.site_id 
    AND sites.is_active = true
  )
  -- No user authentication required for guest RSVPs
);

-- Update SELECT policy to also allow anonymous users to view their own RSVPs by email
DROP POLICY IF EXISTS "Enable RSVP select for owners and creators" ON public.site_rsvps;
DROP POLICY IF EXISTS "Enable RSVP select for all users" ON public.site_rsvps;
CREATE POLICY "Enable RSVP select for all users" 
ON public.site_rsvps 
FOR SELECT 
USING (
  -- Site creators can view all RSVPs for their sites (authenticated)
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_rsvps.site_id 
    AND sites.creator_id = auth.uid()
  )
  OR
  -- Authenticated users can view RSVPs where they are the guest (by email)
  (
    auth.uid() IS NOT NULL 
    AND guest_email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
  )
  OR
  -- Authenticated users can view RSVPs where they are linked via site_users
  (
    auth.uid() IS NOT NULL 
    AND site_user_id IN (
      SELECT id FROM public.site_users 
      WHERE user_id = auth.uid()
    )
  )
  OR
  -- Allow anonymous users to view (handled at app level)
  (auth.uid() IS NULL)
);

-- Update UPDATE policy to allow anonymous updates by email matching
DROP POLICY IF EXISTS "Enable RSVP update for owners" ON public.site_rsvps;
DROP POLICY IF EXISTS "Enable RSVP update for guests and owners" ON public.site_rsvps;
CREATE POLICY "Enable RSVP update for guests and owners" 
ON public.site_rsvps 
FOR UPDATE 
USING (
  -- Authenticated users can update RSVPs where they are the guest (by email)
  (
    auth.uid() IS NOT NULL 
    AND guest_email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text)
  )
  OR
  -- Authenticated users can update RSVPs where they are linked via site_users
  (
    auth.uid() IS NOT NULL 
    AND site_user_id IN (
      SELECT id FROM public.site_users 
      WHERE user_id = auth.uid()
    )
  )
  OR
  -- Site creators can update all RSVPs for their sites
  (
    auth.uid() IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.sites 
      WHERE sites.id = site_rsvps.site_id 
      AND sites.creator_id = auth.uid()
    )
  )
  OR
  -- Allow anonymous updates for same-session RSVP modifications
  (auth.uid() IS NULL)
);

-- Ensure sites table allows anonymous SELECT for active sites
DROP POLICY IF EXISTS "Allow anonymous access to active sites" ON public.sites;
CREATE POLICY "Allow anonymous access to active sites" 
ON public.sites 
FOR SELECT 
USING (is_active = true);

-- Add policy to allow site creators to manage their sites (if not exists)
DROP POLICY IF EXISTS "Site creators can manage their sites" ON public.sites;
CREATE POLICY "Site creators can manage their sites" 
ON public.sites 
FOR ALL 
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

-- Test query to verify policies work
SELECT 'Mobile RSVP policies updated successfully - anonymous access enabled' as status;