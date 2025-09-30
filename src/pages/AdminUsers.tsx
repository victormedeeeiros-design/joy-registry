import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useApprovalSystem, PendingUser } from "@/hooks/useApprovalSystem";
import { 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Calendar,
  ArrowLeft,
  RefreshCw
} from "lucide-react";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { 
    loading, 
    getPendingUsers, 
    approveUser, 
    rejectUser, 
    isUserAdmin 
  } = useApprovalSystem();
  
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const checkAdminAndLoadUsers = async () => {
      if (!profile) {
        navigate('/');
        return;
      }

      const adminCheck = await isUserAdmin();
      if (!adminCheck) {
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      loadPendingUsers();
    };

    checkAdminAndLoadUsers();
  }, [profile, navigate]);

  const loadPendingUsers = async () => {
    const users = await getPendingUsers();
    setPendingUsers(users);
  };

  const handleApprove = async (user: PendingUser) => {
    const success = await approveUser(user.id, user.name, user.email);
    if (success) {
      setPendingUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleReject = async (user: PendingUser) => {
    const success = await rejectUser(user.id, user.name, user.email);
    if (success) {
      setPendingUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPendingUsers();
    setRefreshing(false);
  };

  if (!profile || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <Shield className="h-6 w-6" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta área.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie aprovações de novos usuários
            </p>
          </div>
          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuários Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Status do Sistema
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Ativo</div>
              <p className="text-xs text-muted-foreground">
                Sistema funcionando normalmente
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Admin Atual
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold truncate">{profile?.name}</div>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.email}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários Aguardando Aprovação
            </CardTitle>
            <CardDescription>
              Lista de usuários que solicitaram acesso à plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && pendingUsers.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Carregando usuários...
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum usuário pendente</h3>
                <p className="text-muted-foreground">
                  Não há solicitações de aprovação no momento.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user, index) => (
                  <div key={user.id}>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold">{user.name}</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Pendente
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleApprove(user)}
                          disabled={loading}
                          size="sm"
                          className="gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => handleReject(user)}
                          disabled={loading}
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                    
                    {index < pendingUsers.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Como funciona o sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">📧 Notificações automáticas</h4>
                <p className="text-muted-foreground">
                  Quando um usuário se cadastra, você recebe um email em {' '}
                  <code className="bg-muted px-1 rounded">victormedeeeiros@gmail.com</code>
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✅ Aprovação/Rejeição</h4>
                <p className="text-muted-foreground">
                  Aprove ou rejeite usuários diretamente neste painel. Eles recebem email de notificação.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🔒 Controle de acesso</h4>
                <p className="text-muted-foreground">
                  Usuários só podem criar sites após aprovação. Usuários rejeitados não têm acesso.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🔄 Atualizações em tempo real</h4>
                <p className="text-muted-foreground">
                  Use o botão "Atualizar" para verificar novas solicitações de cadastro.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;