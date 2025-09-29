-- Create user profiles table for different user types
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('platform_admin', 'site_creator', 'gift_giver')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create sites table for gift registry sites
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  layout_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  hero_images TEXT[] DEFAULT '{}',
  story_images TEXT[] DEFAULT '{}',
  story_text TEXT,
  custom_domain TEXT,
  is_active BOOLEAN DEFAULT true,
  stripe_public_key TEXT,
  stripe_secret_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sites
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- Create policies for sites
CREATE POLICY "Site creators can manage their sites" 
ON public.sites 
FOR ALL 
USING (creator_id = auth.uid());

CREATE POLICY "Public can view active sites" 
ON public.sites 
FOR SELECT 
USING (is_active = true);

-- Create site_products table for customized products per site
CREATE TABLE public.site_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  custom_name TEXT,
  custom_description TEXT,
  custom_price NUMERIC,
  custom_image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on site_products
ALTER TABLE public.site_products ENABLE ROW LEVEL SECURITY;

-- Create policies for site_products
CREATE POLICY "Site creators can manage their site products" 
ON public.site_products 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.sites 
  WHERE sites.id = site_products.site_id 
  AND sites.creator_id = auth.uid()
));

CREATE POLICY "Public can view available site products" 
ON public.site_products 
FOR SELECT 
USING (is_available = true AND EXISTS (
  SELECT 1 FROM public.sites 
  WHERE sites.id = site_products.site_id 
  AND sites.is_active = true
));

-- Create orders table for gift purchases
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.sites(id),
  giver_email TEXT NOT NULL,
  giver_name TEXT NOT NULL,
  giver_message TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  total_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Site creators can view their site orders" 
ON public.orders 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.sites 
  WHERE sites.id = orders.site_id 
  AND sites.creator_id = auth.uid()
));

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  site_product_id UUID NOT NULL REFERENCES public.site_products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for order_items
CREATE POLICY "Site creators can view their order items" 
ON public.order_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders o
  JOIN public.sites s ON s.id = o.site_id
  WHERE o.id = order_items.order_id 
  AND s.creator_id = auth.uid()
));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'site_creator'  -- Default user type
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create update triggers for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_products_updated_at
  BEFORE UPDATE ON public.site_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();