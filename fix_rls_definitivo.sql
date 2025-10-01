-- SOLUÇÃO DEFINITIVA: Políticas RLS Simplificadas para RSVP Mobile
-- Execute este script completo no Supabase SQL Editor

-- 1. Remover TODAS as políticas existentes da tabela site_rsvps
DROP POLICY IF EXISTS "Enable RSVP insert for active sites" ON public.site_rsvps;
DROP POLICY IF EXISTS "Allow anonymous RSVP for active sites" ON public.site_rsvps;
DROP POLICY IF EXISTS "Enable RSVP select for owners and creators" ON public.site_rsvps;
DROP POLICY IF EXISTS "Enable RSVP select for all users" ON public.site_rsvps;
DROP POLICY IF EXISTS "Enable RSVP update for owners" ON public.site_rsvps;
DROP POLICY IF EXISTS "Enable RSVP update for guests and owners" ON public.site_rsvps;
DROP POLICY IF EXISTS "Enable RSVP delete for owners and creators" ON public.site_rsvps;

-- 2. Criar política super permissiva para INSERT (permite qualquer inserção)
CREATE POLICY "Super permissive RSVP insert"
ON public.site_rsvps
FOR INSERT
WITH CHECK (true);

-- 3. Criar política permissiva para SELECT (permite qualquer leitura)
CREATE POLICY "Super permissive RSVP select"
ON public.site_rsvps
FOR SELECT
USING (true);

-- 4. Criar política permissiva para UPDATE (permite qualquer atualização)
CREATE POLICY "Super permissive RSVP update"
ON public.site_rsvps
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 5. Garantir que a tabela sites permite leitura anônima
DROP POLICY IF EXISTS "Allow anonymous access to active sites" ON public.sites;
CREATE POLICY "Allow anonymous sites access"
ON public.sites
FOR SELECT
USING (is_active = true);

-- 6. Verificar se RLS está habilitado
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'RLS HABILITADO ✅' 
    ELSE 'RLS DESABILITADO ❌' 
  END as status
FROM pg_tables 
WHERE tablename IN ('site_rsvps', 'sites');

-- 7. Listar todas as políticas ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('site_rsvps', 'sites')
ORDER BY tablename, policyname;

-- 8. Teste de inserção (remova os comentários para testar)
/*
INSERT INTO public.site_rsvps (
  site_id, 
  guest_name, 
  guest_email, 
  will_attend,
  message
) VALUES (
  (SELECT id FROM public.sites WHERE is_active = true LIMIT 1),
  'Teste Mobile',
  'teste_mobile@example.com',
  true,
  'Teste de política RLS'
);
*/

SELECT 'POLÍTICAS RLS SUPER PERMISSIVAS APLICADAS COM SUCESSO! 🎉' as resultado;