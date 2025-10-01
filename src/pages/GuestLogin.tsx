import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { testSupabaseConnection, diagnoseMobileIssues } from '@/lib/supabase-diagnostics';

export default function GuestLogin() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Armazena o siteId em um estado para maior confiabilidade
  const [siteId, setSiteId] = useState<string | null>(null);
  const [willAttend, setWillAttend] = useState<boolean | null>(null);

  useEffect(() => {
    const rsvpParam = searchParams.get('rsvp');
    const siteIdParam = searchParams.get('siteId');
    
    console.log('GuestLogin - URL params:', { rsvpParam, siteIdParam });

    if (siteIdParam) {
      setSiteId(siteIdParam);
    }
    
    if (rsvpParam) {
      setWillAttend(rsvpParam === 'yes');
    } else {
      // Se não há parâmetro RSVP, redireciona para auth
      console.log('GuestLogin - Sem parâmetro RSVP, redirecionando para auth');
      navigate(`/auth?site=${siteIdParam || ''}`);
      return;
    }
  }, [searchParams, navigate]);

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Por favor, digite seu nome para confirmar a presença.');
      return;
    }
    
    if (!email.trim()) {
      toast.error('Por favor, digite seu email para confirmar a presença.');
      return;
    }

    // Validação crucial: Garante que o siteId existe antes de continuar
    if (!siteId) {
      toast.error('Erro: ID do site não encontrado. Não foi possível confirmar a presença.');
      console.error('Tentativa de RSVP sem siteId.');
      return;
    }

    // Garantir que willAttend tem um valor válido
    if (willAttend === null) {
      toast.error('Status de presença não definido. Tente novamente.');
      return;
    }

    setLoading(true);

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    try {
      console.log('Inserindo RSVP com dados:', {
        site_id: siteId,
        guest_name: name.trim(),
        guest_email: email.trim(),
        will_attend: willAttend,
        isMobile,
        userAgent: navigator.userAgent
      });

      // Estratégia unificada: usar sempre upsert para evitar duplicatas
      const rsvpData = {
        site_id: siteId,
        guest_name: name.trim(),
        guest_email: email.trim(),
        will_attend: willAttend,
        message: null
      };

      // Primeiro verificar se o site existe e está ativo
      console.log('🔍 Verificando se o site está ativo...');
      const { data: siteCheck, error: siteError } = await supabase
        .from('sites')
        .select('id, title, is_active')
        .eq('id', siteId)
        .eq('is_active', true)
        .single();

      if (siteError || !siteCheck) {
        throw new Error('Site não encontrado ou inativo. Verifique se o link está correto.');
      }

      console.log('✅ Site ativo confirmado:', siteCheck.title);
      console.log('🔄 Tentando inserir/atualizar RSVP...');

      const { data, error } = await supabase
        .from('site_rsvps')
        .upsert(rsvpData, {
          onConflict: 'site_id,guest_email',
          ignoreDuplicates: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erro Supabase:', error);
        throw error;
      }

      console.log('RSVP inserido com sucesso:', data);

      // Envia o e-mail de notificação de forma assíncrona
      try {
        await supabase.functions.invoke('send-rsvp-email', {
          body: {
            siteId: siteId,
            guestName: name.trim(),
            guestEmail: email.trim(),
            willAttend: willAttend,
            message: null,
            siteTitle: 'Lista de Presentes'
          },
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Não falhar o processo por causa do email
      }

      toast.success(willAttend ? 'Presença confirmada com sucesso!' : 'Resposta registrada com sucesso!');
      
      // Limpa o estado e redireciona de volta para o site público
      localStorage.removeItem('currentSiteId');
      
      // Redirecionar de volta para o site usando o ID
      navigate(`/site/${siteId}`);

    } catch (error: any) {
      console.error('Erro ao confirmar presença:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userAgent: navigator.userAgent,
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      });
      
      let errorMessage = 'Ocorreu um erro ao confirmar sua presença. Tente novamente.';
      
      if (error.message?.includes('violates row-level security policy')) {
        const mobileInfo = diagnoseMobileIssues();
        
        if (mobileInfo.isMobile) {
          console.log('🚨 RLS Error no mobile - tentando método alternativo...');
          
          // Para mobile: tentar usando uma Edge Function como fallback
          try {
            const fallbackResult = await supabase.functions.invoke('mobile-rsvp-fallback', {
              body: {
                site_id: siteId,
                guest_name: name.trim(),
                guest_email: email.trim(),
                will_attend: willAttend,
                user_agent: navigator.userAgent
              }
            });

            if (fallbackResult.error) {
              throw fallbackResult.error;
            }

            console.log('✅ Fallback mobile funcionou:', fallbackResult.data);
            toast.success(willAttend ? 'Presença confirmada com sucesso!' : 'Resposta registrada com sucesso!');
            
            // Continuar com o fluxo normal
            localStorage.removeItem('currentSiteId');
            navigate(`/site/${siteId}`);
            return;
            
          } catch (fallbackError) {
            console.error('❌ Fallback também falhou:', fallbackError);
            errorMessage = 'Problema específico do celular detectado. Por favor, tente pelo computador ou entre em contato conosco.';
          }
        } else {
          errorMessage = 'Erro de permissão detectado. As configurações de segurança estão sendo atualizadas...';
        }
        
        // Executar diagnósticos
        console.log('🔧 Executando diagnósticos...', mobileInfo);
        
        // Testar conexão em background
        testSupabaseConnection().then(isWorking => {
          if (!isWorking) {
            console.log('🚨 Confirmado: Problema nas políticas RLS');
          }
        });
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = 'Você já confirmou presença para este evento.';
      } else if (error.message?.includes('null value')) {
        errorMessage = 'Dados incompletos. Verifique se todos os campos estão preenchidos.';
      } else if (error.code === 'PGRST301') {
        errorMessage = 'Erro de configuração do servidor. Tente novamente em alguns minutos.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (willAttend === null) return 'Confirmar Presença';
    return willAttend ? 'Confirmar Presença' : 'Recusar Convite';
  };

  const getDescription = () => {
    if (willAttend === null) return 'Digite seu nome para confirmar sua presença no evento.';
    return willAttend
      ? 'Estamos felizes por você vir! Digite seu nome para confirmar.'
      : 'Que pena que você não poderá comparecer. Deixe seu nome para sabermos.';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRSVP}>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
              <Input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Confirmando...' : 'Confirmar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}