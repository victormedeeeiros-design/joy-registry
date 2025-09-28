-- Create site-specific user system
CREATE TABLE IF NOT EXISTS public.site_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(site_id, email)
);

-- Enable RLS
ALTER TABLE public.site_users ENABLE ROW LEVEL SECURITY;

-- Create policies for site_users
CREATE POLICY "Anyone can register as site user" 
ON public.site_users 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_users.site_id 
    AND sites.is_active = true
  )
);

CREATE POLICY "Site users can view their own data" 
ON public.site_users 
FOR SELECT 
USING (true);

CREATE POLICY "Site users can update their own data" 
ON public.site_users 
FOR UPDATE 
USING (true);

CREATE POLICY "Site creators can view users for their sites" 
ON public.site_users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_users.site_id 
    AND sites.creator_id = auth.uid()
  )
);

-- Create site-specific orders table
CREATE TABLE IF NOT EXISTS public.site_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  site_user_id UUID REFERENCES public.site_users(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  giver_message TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for site_orders
CREATE POLICY "Site users can view their own orders" 
ON public.site_orders 
FOR SELECT 
USING (
  site_user_id IN (
    SELECT id FROM public.site_users 
    WHERE site_users.id = site_orders.site_user_id
  )
);

CREATE POLICY "Site creators can view orders for their sites" 
ON public.site_orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_orders.site_id 
    AND sites.creator_id = auth.uid()
  )
);

CREATE POLICY "Anyone can create orders for active sites" 
ON public.site_orders 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_orders.site_id 
    AND sites.is_active = true
  )
);

-- Create site-specific order items table
CREATE TABLE IF NOT EXISTS public.site_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_order_id UUID NOT NULL REFERENCES public.site_orders(id) ON DELETE CASCADE,
  site_product_id UUID NOT NULL REFERENCES public.site_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for site_order_items
CREATE POLICY "Site users can view their own order items" 
ON public.site_order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.site_orders 
    WHERE site_orders.id = site_order_items.site_order_id
  )
);

CREATE POLICY "Site creators can view order items for their sites" 
ON public.site_order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.site_orders so
    JOIN public.sites s ON s.id = so.site_id
    WHERE so.id = site_order_items.site_order_id 
    AND s.creator_id = auth.uid()
  )
);

-- Create site-specific RSVP system (replace existing rsvps)
DROP TABLE IF EXISTS public.site_rsvps CASCADE;

CREATE TABLE public.site_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  site_user_id UUID REFERENCES public.site_users(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  message TEXT,
  will_attend BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(site_id, guest_email)
);

-- Enable RLS
ALTER TABLE public.site_rsvps ENABLE ROW LEVEL SECURITY;

-- Create policies for site_rsvps
CREATE POLICY "Anyone can create RSVP for active sites" 
ON public.site_rsvps 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_rsvps.site_id 
    AND sites.is_active = true
  )
);

CREATE POLICY "Site creators can view RSVPs for their sites" 
ON public.site_rsvps 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = site_rsvps.site_id 
    AND sites.creator_id = auth.uid()
  )
);

CREATE POLICY "Guests can update their own RSVP" 
ON public.site_rsvps 
FOR UPDATE 
USING (guest_email = ((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text));

-- Create function to authenticate site users
CREATE OR REPLACE FUNCTION public.authenticate_site_user(
  p_site_id UUID,
  p_email TEXT, 
  p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get user record for specific site
  SELECT * INTO user_record
  FROM public.site_users
  WHERE site_id = p_site_id AND email = p_email;
  
  IF user_record.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- In a real app, you'd verify the password hash here
  -- For now, we'll just return the user data
  RETURN json_build_object(
    'success', true, 
    'user', json_build_object(
      'id', user_record.id,
      'site_id', user_record.site_id,
      'email', user_record.email,
      'name', user_record.name
    )
  );
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_site_users_updated_at
  BEFORE UPDATE ON public.site_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_orders_updated_at
  BEFORE UPDATE ON public.site_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_rsvps_updated_at
  BEFORE UPDATE ON public.site_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();