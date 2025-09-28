import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Globe, 
  ShoppingBag, 
  TrendingUp,
  Plus,
  Settings
} from "lucide-react";

interface DashboardStats {
  totalSites: number;
  totalUsers: number;
  totalLayouts: number;
  activeOrders: number;
}

const PlatformAdminDashboard = () => {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSites: 0,
    totalUsers: 0,
    totalLayouts: 0,
    activeOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get total sites
      const { count: sitesCount } = await supabase
        .from('sites')
        .select('*', { count: 'exact', head: true });

      // Get total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total layouts (products)
      const { count: layoutsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get active orders
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalSites: sitesCount || 0,
        totalUsers: usersCount || 0,
        totalLayouts: layoutsCount || 0,
        activeOrders: ordersCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin da Plataforma</h1>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Admin</Badge>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Sites</p>
                  <p className="text-2xl font-bold">{loading ? "..." : stats.totalSites}</p>
                </div>
                <Globe className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                  <p className="text-2xl font-bold">{loading ? "..." : stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Layouts Disponíveis</p>
                  <p className="text-2xl font-bold">{loading ? "..." : stats.totalLayouts}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pedidos Ativos</p>
                  <p className="text-2xl font-bold">{loading ? "..." : stats.activeOrders}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Gerenciar Layouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Criar e gerenciar layouts de sites para eventos
              </p>
              <Button className="w-full">Acessar Layouts</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciar Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Visualizar e gerenciar todos os usuários da plataforma
              </p>
              <Button variant="outline" className="w-full">Acessar Usuários</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Configurar a plataforma e integração com Stripe
              </p>
              <Button variant="outline" className="w-full">Configurar</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlatformAdminDashboard;