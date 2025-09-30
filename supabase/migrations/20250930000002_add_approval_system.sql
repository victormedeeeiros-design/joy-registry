-- Adicionar campos de aprovação na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status 
ON public.profiles(approval_status);

-- Aprovar usuários existentes automaticamente (para não quebrar o sistema atual)
UPDATE public.profiles 
SET approval_status = 'approved', approved_at = NOW() 
WHERE approval_status IS NULL OR approval_status = 'pending';

-- Criar tabela de admins
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar você como admin
INSERT INTO public.admins (user_id, email)
SELECT id, email FROM public.profiles 
WHERE email = 'victormedeeeiros@gmail.com'
ON CONFLICT (email) DO NOTHING;

-- Políticas RLS para aprovação
CREATE POLICY "Users can view own approval status" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can manage approvals" ON public.profiles
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admins WHERE email = auth.email())
);

CREATE POLICY "Admin can view all users" ON public.profiles
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admins WHERE email = auth.email())
);

-- Políticas para tabela admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin table" ON public.admins
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admins WHERE email = auth.email())
);

CREATE POLICY "Admins can manage admin table" ON public.admins
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE email = auth.email())
);