-- Create guest_users table for gift buyers (separate from admin profiles)
CREATE TABLE public.guest_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guest_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for guest_users
CREATE POLICY "Guest users can view their own data"
  ON public.guest_users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Guest users can update their own data"
  ON public.guest_users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Create table for guest purchases/orders
CREATE TABLE public.guest_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_user_id uuid REFERENCES public.guest_users(id) ON DELETE CASCADE,
  site_id uuid REFERENCES public.sites(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending',
  stripe_payment_intent_id text,
  giver_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guest_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for guest_orders
CREATE POLICY "Guest users can view their own orders"
  ON public.guest_orders FOR SELECT
  USING (auth.uid()::text = guest_user_id::text);

CREATE POLICY "Site creators can view orders for their sites"
  ON public.guest_orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.sites 
    WHERE sites.id = guest_orders.site_id 
    AND sites.creator_id = auth.uid()
  ));

-- Create table for guest order items
CREATE TABLE public.guest_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_order_id uuid REFERENCES public.guest_orders(id) ON DELETE CASCADE,
  site_product_id uuid REFERENCES public.site_products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guest_order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for guest_order_items
CREATE POLICY "Guest users can view their own order items"
  ON public.guest_order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.guest_orders
    WHERE guest_orders.id = guest_order_items.guest_order_id
    AND auth.uid()::text = guest_orders.guest_user_id::text
  ));

-- Triggers for updated_at
CREATE TRIGGER update_guest_users_updated_at
  BEFORE UPDATE ON public.guest_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guest_orders_updated_at
  BEFORE UPDATE ON public.guest_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();