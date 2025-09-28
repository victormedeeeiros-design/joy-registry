import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Heart, Gift, CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'yes' | 'no' | null>(null);
  const { user, profile, loading: authLoading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const rsvpParam = searchParams.get('rsvp');
    if (rsvpParam === 'yes' || rsvpParam === 'no') {
      setRsvpStatus(rsvpParam as 'yes' | 'no');
      setShowRSVP(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.user_type === 'platform_admin') {
        navigate('/admin', { replace: true });
      } else if (profile.user_type === 'site_creator') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [authLoading, user, profile, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
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

    const { error } = await signUp(email, password, name);
    
    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Verifique seu email para confirmar a conta!",
      });
    }
    setLoading(false);
  };

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const siteId = searchParams.get('site') || localStorage.getItem('currentSiteId');
      
      if (!siteId) {
        throw new Error('ID do site não encontrado');
      }

      const { error } = await supabase
        .from('rsvps')
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
                'Acesso Administrativo'
              )}
            </CardTitle>
            <p className="text-muted-foreground">
              {showRSVP 
                ? 'Por favor, confirme sua participação no evento'
                : 'Entre para gerenciar sites e configurações'
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
              </form>
            ) : (
              <Tabs defaultValue="signin" className="space-y-4">
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;