import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

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

    try {
      console.log('Inserindo RSVP com dados:', {
        site_id: siteId,
        guest_name: name.trim(),
        guest_email: email.trim(),
        will_attend: willAttend
      });

      const { data, error } = await supabase
        .from('site_rsvps')
        .insert({
          site_id: siteId,
          guest_name: name.trim(),
          guest_email: email.trim(),
          will_attend: willAttend,
          message: null // Explicitamente definir como null
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
      
      let errorMessage = 'Ocorreu um erro ao confirmar sua presença. Tente novamente.';
      
      if (error.message?.includes('violates row-level security policy')) {
        errorMessage = 'Falha de segurança ao confirmar presença. O site pode não estar ativo.';
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = 'Você já confirmou presença para este evento.';
      } else if (error.message?.includes('null value')) {
        errorMessage = 'Dados incompletos. Verifique se todos os campos estão preenchidos.';
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