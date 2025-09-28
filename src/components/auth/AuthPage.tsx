import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Heart, Gift, CheckCircle } from "lucide-react";
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
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
    }
    
    setLoading(false);
  };

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get current site from URL or localStorage
      const currentPath = window.location.pathname;
      const siteId = currentPath.includes('/site/') ? 
        currentPath.split('/site/')[1] : 
        localStorage.getItem('currentSiteId');
      
      if (!siteId) {
        toast({
          title: "Erro",
          description: "Não foi possível identificar o site.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('rsvps')
        .upsert({
          site_id: siteId,
          guest_name: guestName,
          guest_email: email,
          will_attend: rsvpStatus === 'yes',
          message: guestMessage
        }, {
          onConflict: 'site_id,guest_email'
        });

      if (error) throw error;

      toast({
        title: "Confirmação recebida!",
        description: `Obrigado por confirmar sua ${rsvpStatus === 'yes' ? 'presença' : 'ausência'}!`,
      });
      
      // Redirect back to site
      navigate(`/site/${siteId}`);
    } catch (error: any) {
      toast({
        title: "Erro ao confirmar presença",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(email, password, name);
    
    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para ativar sua conta.",
      });
    }
    
    setLoading(false);
  };
    <div className="min-h-screen gradient-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="h-8 w-8 text-primary" />
            <Heart className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            {showRSVP ? 'Confirmação de Presença' : 'Gift Registry'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {showRSVP ? 
              `Por favor, confirme sua ${rsvpStatus === 'yes' ? 'presença' : 'ausência'} no evento` :
              'Crie sua lista de presentes personalizada'
            }
          </p>
        </div>

        <Card className="gradient-card border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
              {showRSVP ? (
                <>
                  {rsvpStatus === 'yes' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Heart className="h-6 w-6 text-gray-500" />
                  )}
                  {rsvpStatus === 'yes' ? 'Vou comparecer!' : 'Não poderei comparecer'}
                </>
              ) : (
                'Bem-vindo'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showRSVP ? (
              <form onSubmit={handleRSVP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guestName">Seu nome</Label>
                  <Input
                    id="guestName"
                    type="text"
                    placeholder="Nome completo"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem (opcional)</Label>
                  <Textarea
                    id="message"
                    placeholder={rsvpStatus === 'yes' ? 
                      "Deixe uma mensagem carinhosa..." : 
                      "Desculpe não poder comparecer..."
                    }
                    value={guestMessage}
                    onChange={(e) => setGuestMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Confirmar"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowRSVP(false)}
                >
                  Ou fazer login/cadastro
                </Button>
              </form>
            ) : (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Cadastrando..." : "Cadastrar"}
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