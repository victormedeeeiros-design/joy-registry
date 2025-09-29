-- Create products table (missing)
CREATE TABLE IF NOT EXISTS public.products (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  description text,
  image_url text,
  category text NOT NULL DEFAULT 'eletrodomesticos',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Platform admins can manage products" 
ON public.products 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.user_type = 'platform_admin'
));

-- Create trigger for updating updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();