-- Create RSVP table for event confirmations
CREATE TABLE public.rsvps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  will_attend boolean NOT NULL,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(site_id, guest_email)
);

-- Enable RLS
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Create policies for RSVP access
CREATE POLICY "Site creators can view their site RSVPs" 
ON public.rsvps 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM sites 
  WHERE sites.id = rsvps.site_id 
  AND sites.creator_id = auth.uid()
));

CREATE POLICY "Anyone can create RSVP for active sites" 
ON public.rsvps 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM sites 
  WHERE sites.id = rsvps.site_id 
  AND sites.is_active = true
));

CREATE POLICY "Guests can update their own RSVP" 
ON public.rsvps 
FOR UPDATE 
USING (guest_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rsvps_updated_at
BEFORE UPDATE ON public.rsvps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add Stripe configuration columns to sites table
ALTER TABLE public.sites 
ADD COLUMN stripe_publishable_key text,
ADD COLUMN payment_method text DEFAULT 'stripe';

-- Add a table for managing payment methods (future use)
CREATE TABLE public.payment_methods (
  id text NOT NULL PRIMARY KEY,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  configuration_fields jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert initial payment methods
INSERT INTO public.payment_methods (id, name, is_active, configuration_fields) VALUES
('stripe', 'Stripe', true, '{"fields": [{"name": "publishable_key", "label": "Chave Pública", "type": "text", "required": true}, {"name": "secret_key", "label": "Chave Secreta", "type": "password", "required": true}]}'),
('paypal', 'PayPal', false, '{"fields": [{"name": "client_id", "label": "Client ID", "type": "text", "required": true}, {"name": "client_secret", "label": "Client Secret", "type": "password", "required": true}]}'),
('mercadopago', 'Mercado Pago', false, '{"fields": [{"name": "access_token", "label": "Access Token", "type": "password", "required": true}]}');

-- Enable RLS on payment_methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policy for payment methods
CREATE POLICY "Anyone can view active payment methods" 
ON public.payment_methods 
FOR SELECT 
USING (is_active = true);