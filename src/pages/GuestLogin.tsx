import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import { useToast } from "@/hooks/use-toast";
import { Heart, Gift, CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const GuestLogin = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'yes' | 'no' | null>(null);
  const { siteUser, loading: authLoading, signIn, signUp } = useSiteAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const rsvpParam = searchParams.get('rsvp');
    if (rsvpParam === 'yes' || rsvpParam === 'no') {
      setRsvpStatus(rsvpParam as 'yes' | 'no');
      setShowRSVP(true);
    }
    // Persist current siteId for safe redirects
    const siteId = searchParams.get('siteId');
    if (siteId) {
      localStorage.setItem('currentSiteId', siteId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && siteUser) {
      // Get the siteId from URL params to redirect back to the correct site
      const siteId = searchParams.get('siteId');
      if (siteId) {
        navigate(`/site/${siteId}`, { replace: true });
      } else {
        // Fallback to localStorage returnUrl, but default to current site if available
        const returnUrl = localStorage.getItem('returnUrl');
        const currentSiteId = localStorage.getItem('currentSiteId');
        localStorage.removeItem('returnUrl');
        
        if (returnUrl) {
          navigate(returnUrl, { replace: true });
        } else if (currentSiteId) {
          navigate(`/site/${currentSiteId}`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    }
  }, [authLoading, siteUser, navigate, searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const siteId = searchParams.get('siteId') || localStorage.getItem('currentSiteId');
    if (!siteId) {
      toast({
        title: "Erro",
        description: "ID do site não encontrado",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await signIn(siteId, email, password);
    
    if (error) {
      toast({
        title: "Erro no login",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const siteId = searchParams.get('siteId') || localStorage.getItem('currentSiteId');
    if (!siteId) {
      toast({
        title: "Erro",
        description: "ID do site não encontrado",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await signUp(siteId, email, password, name);
    
    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Bem-vindo!",
      });
    }
    setLoading(false);
  };

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const siteId = searchParams.get('siteId') || searchParams.get('site') || localStorage.getItem('currentSiteId');
      
      if (!siteId) {
        throw new Error('ID do site não encontrado');
      }

      const { error } = await supabase
        .from('site_rsvps')
        .upsert({
          site_id: siteId,
          guest_name: guestName,
          guest_email: email || `guest_${Date.now()}@temp.com`,
          message: guestMessage,
          will_attend: rsvpStatus === 'yes'
        });

      if (error) throw error;

      toast({
        title: "RSVP enviado com sucesso!",
        description: rsvpStatus === 'yes' 
          ? "Obrigado por confirmar sua presença!" 
          : "Obrigado por nos avisar!",
      });

      // Redirect back to the site
      navigate(`/site/${siteId}`, { replace: true });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar RSVP",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="gradient-card border-0 shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {showRSVP ? (
                rsvpStatus === 'yes' ? 'Confirmar Presença' : 'Informar Ausência'
              ) : (
                'Acesso para Compradores'
              )}
            </CardTitle>
            <p className="text-muted-foreground">
              {showRSVP 
                ? 'Por favor, confirme sua participação no evento'
                : 'Entre ou cadastre-se para comprar presentes'
              }
            </p>
          </CardHeader>
          <CardContent>
            {showRSVP ? (
              <form onSubmit={handleRSVP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guestName">Nome completo</Label>
                  <Input
                    id="guestName"
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem (opcional)</Label>
                  <Textarea
                    id="message"
                    value={guestMessage}
                    onChange={(e) => setGuestMessage(e.target.value)}
                    placeholder="Deixe uma mensagem especial..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {rsvpStatus === 'yes' ? 'Confirmar Presença' : 'Informar Ausência'}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowRSVP(false);
                      setRsvpStatus(null);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-3">
                  Prefere entrar ou cadastrar-se?
                  <button
                    type="button"
                    className="ml-1 underline hover:text-foreground"
                    onClick={() => {
                      setShowRSVP(false);
                      setRsvpStatus(null);
                    }}
                  >
                    Acessar com email e senha
                  </button>
                </p>
              </form>
            ) : (
              <><Tabs defaultValue="signin" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Senha</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome completo</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Crie uma senha"
                        required
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        "Cadastrar"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              <p className="text-center text-sm text-muted-foreground mt-3">
                Quer apenas confirmar presença?
                <button
                  type="button"
                  className="ml-1 underline hover:text-foreground"
                  onClick={() => {
                    setShowRSVP(true);
                    setRsvpStatus('yes');
                  }}
                >
                  Confirmar presença sem login
                </button>
              </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuestLogin;