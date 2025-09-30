-- Script para configurar o usuário admin inicial
-- Execute este script após aplicar a migração de aprovação

-- 1. Atualizar o perfil do admin para aprovado
UPDATE profiles 
SET approval_status = 'approved' 
WHERE email = 'victormedeeeiros@gmail.com';

-- 2. Se o perfil não existir, você pode criá-lo manualmente (opcional)
-- INSERT INTO profiles (id, email, full_name, approval_status, created_at, updated_at)
-- VALUES (
--   'admin-user-id', -- Substitua pelo ID real do usuário do auth
--   'victormedeeeiros@gmail.com',
--   'Victor Medeiros',
--   'approved',
--   NOW(),
--   NOW()
-- );

-- 3. Verificar se a configuração está correta
SELECT email, full_name, approval_status, created_at 
FROM profiles 
WHERE email = 'victormedeeeiros@gmail.com';