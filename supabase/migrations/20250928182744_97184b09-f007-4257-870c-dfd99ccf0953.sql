-- Populate products table with wedding gift list
INSERT INTO public.products (id, name, price, category, description, image_url, status) VALUES
-- Eletrodomésticos
('microwave', 'Micro-ondas', 780.00, 'eletrodomesticos', 'Micro-ondas moderno para facilitar o preparo das refeições', '/products/microwave.jpg', 'active'),
('range-hood', 'Coifa', 650.00, 'eletrodomesticos', 'Coifa para cozinha com excelente capacidade de sucção', '/products/range-hood.jpg', 'active'),
('grill', 'Grill', 180.00, 'eletrodomesticos', 'Grill elétrico para preparar carnes e legumes', '/products/grill.jpg', 'active'),
('blender', 'Liquidificador', 210.00, 'eletrodomesticos', 'Liquidificador potente para vitaminas e sucos', '/products/blender.jpg', 'active'),
('mixer', 'Batedeira', 550.00, 'eletrodomesticos', 'Batedeira planetária para massas e cremes', '/products/mixer.jpg', 'active'),
('electric-oven', 'Forno elétrico', 480.00, 'eletrodomesticos', 'Forno elétrico compacto e eficiente', '/products/electric-oven.jpg', 'active'),
('air-fryer', 'Air Fryer', 450.00, 'eletrodomesticos', 'Fritadeira elétrica sem óleo', '/products/air-fryer.jpg', 'active'),
('stove', 'Fogão', 850.00, 'eletrodomesticos', 'Fogão 4 bocas com forno', '/products/stove.jpg', 'active'),
('refrigerator', 'Geladeira', 2500.00, 'eletrodomesticos', 'Geladeira duplex frost free', '/products/refrigerator.jpg', 'active'),
('dishwasher', 'Lava-louça', 3100.00, 'eletrodomesticos', 'Lava-louça automática para 12 serviços', '/products/dishwasher.jpg', 'active'),
('water-dispenser', 'Bebedouro', 380.00, 'eletrodomesticos', 'Bebedouro com água natural e gelada', '/products/water-dispenser.jpg', 'active'),
('toaster', 'Torradeira', 140.00, 'eletrodomesticos', 'Torradeira para 2 fatias com controle de tostagem', '/products/toaster.jpg', 'active'),
('coffee-maker', 'Cafeteira', 220.00, 'eletrodomesticos', 'Cafeteira elétrica para café coado', '/products/coffee-maker.jpg', 'active'),

-- Utensílios
('strainer', 'Escorredor', 95.00, 'utensilios', 'Escorredor de louça em aço inox', '/products/strainer.jpg', 'active'),
('cookware-set', 'Jogo de panelas', 420.00, 'utensilios', 'Jogo completo de panelas antiaderentes', '/products/cookware-set.jpg', 'active'),
('pressure-cooker', 'Panela de pressão', 180.00, 'utensilios', 'Panela de pressão 6 litros', '/products/pressure-cooker.jpg', 'active'),
('kettle', 'Chaleira', 130.00, 'utensilios', 'Chaleira em aço inox com apito', '/products/kettle.jpg', 'active'),
('cutting-boards', 'Tábuas de cozinha', 75.00, 'utensilios', 'Conjunto de tábuas de bambu', '/products/cutting-boards.jpg', 'active'),
('dish-towels', 'Panos de prato', 50.00, 'utensilios', 'Kit com 6 panos de prato', '/products/dish-towels.jpg', 'active'),
('fruit-bowl', 'Fruteira', 85.00, 'utensilios', 'Fruteira decorativa em metal', '/products/fruit-bowl.jpg', 'active'),
('storage-containers', 'Potes', 90.00, 'utensilios', 'Conjunto de potes herméticos', '/products/storage-containers.jpg', 'active'),
('thermos', 'Garrafa térmica', 100.00, 'utensilios', 'Garrafa térmica 1 litro', '/products/thermos.jpg', 'active'),
('sieve', 'Peneira', 30.00, 'utensilios', 'Peneira fina para coar', '/products/sieve.jpg', 'active'),
('strainer-small', 'Coador', 35.00, 'utensilios', 'Coador de café em pano', '/products/strainer-small.jpg', 'active'),
('pitchers', 'Jarras', 70.00, 'utensilios', 'Conjunto de jarras de vidro', '/products/pitchers.jpg', 'active'),
('measuring-cup', 'Medidor de alimento', 40.00, 'utensilios', 'Conjunto de medidores', '/products/measuring-cup.jpg', 'active'),

-- Outros
('cutlery-holder', 'Porta talheres', 50.00, 'outros', 'Porta talheres em madeira', '/products/cutlery-holder.jpg', 'active'),
('salt-shaker', 'Saleiro', 35.00, 'outros', 'Saleiro e pimenteiro', '/products/salt-shaker.jpg', 'active')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;