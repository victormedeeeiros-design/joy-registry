-- Enable aniversario layout
UPDATE public.layouts 
SET 
  is_available = true,
  description = 'Layout festivo para comemorações de aniversário com seções especiais para presentes e celebração',
  features = ARRAY['Lista de presentes personalizada', 'Galeria de fotos', 'Mensagem de aniversário', 'RSVP para festa', 'Contador de idade', 'Seção de desejos']
WHERE id = 'aniversario';