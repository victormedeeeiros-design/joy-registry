-- Create layouts table
CREATE TABLE public.layouts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_available BOOLEAN NOT NULL DEFAULT false,
  category TEXT,
  features TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.layouts ENABLE ROW LEVEL SECURITY;

-- Create policies for layouts (public read access for available layouts)
CREATE POLICY "Anyone can view available layouts" 
ON public.layouts 
FOR SELECT 
USING (is_available = true);

-- Create policy for service role to manage layouts
CREATE POLICY "Service role can manage layouts" 
ON public.layouts 
FOR ALL 
USING (auth.role() = 'service_role');

-- Insert the available layouts
INSERT INTO public.layouts (id, name, description, is_available, category, features) VALUES
('cha-casa-nova', 'Chá de Casa Nova', 'Layout especial para celebrar sua nova casa, com seções para presentes essenciais e decoração', true, 'casa-nova', ARRAY['Seções organizadas', 'Lista de presentes', 'Fotos da casa', 'Mensagem personalizada']),
('casamento', 'Casamento', 'Layout elegante para listas de casamento', false, 'casamento', ARRAY['Em breve']),
('cha-bebe', 'Chá de Bebê', 'Layout fofo para celebrar a chegada do bebê', false, 'bebe', ARRAY['Em breve']),
('aniversario', 'Aniversário', 'Layout festivo para comemorações de aniversário', false, 'aniversario', ARRAY['Em breve']);

-- Create trigger for updating updated_at
CREATE TRIGGER update_layouts_updated_at
BEFORE UPDATE ON public.layouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();