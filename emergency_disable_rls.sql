-- EMERGÊNCIA: Desabilitar RLS temporariamente para site_rsvps
-- Execute este script APENAS se o problema persistir no mobile

-- Temporariamente desabilitar RLS na tabela site_rsvps
ALTER TABLE public.site_rsvps DISABLE ROW LEVEL SECURITY;

-- Confirmar que RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'site_rsvps';

SELECT 'ATENÇÃO: RLS desabilitado temporariamente para site_rsvps' as warning;

-- IMPORTANTE: Reabilitar RLS após confirmar que funciona:
-- ALTER TABLE public.site_rsvps ENABLE ROW LEVEL SECURITY;