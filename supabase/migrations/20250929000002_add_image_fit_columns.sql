-- Adicionar campos de configuração de enquadramento de imagens
ALTER TABLE sites 
ADD COLUMN hero_image_fit TEXT DEFAULT 'cover' CHECK (hero_image_fit IN ('cover', 'contain', 'fill')),
ADD COLUMN story_image_fit TEXT DEFAULT 'cover' CHECK (story_image_fit IN ('cover', 'contain', 'fill'));

-- Comentários para documentação
COMMENT ON COLUMN sites.hero_image_fit IS 'Configuração de enquadramento das imagens do hero: cover, contain ou fill';
COMMENT ON COLUMN sites.story_image_fit IS 'Configuração de enquadramento das imagens da história: cover, contain ou fill';