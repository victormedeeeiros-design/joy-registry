import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  Globe, 
  ShoppingBag, 
  TrendingUp,
  Plus,
  Settings,
  Eye,
  Edit
} from "lucide-react";

import { generateSiteUrl } from "@/lib/slug";

interface Site {
  id: string;
  slug?: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  layout_id: string;
}

const SiteCreatorDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadSites();
    }
  }, [profile]);

  const loadSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('creator_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Error loading sites:', error);
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
          <div>
            <h1 className="text-2xl font-bold">Meus Sites de Presentes</h1>
            <p className="text-muted-foreground">Olá, {profile?.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">Criador</Badge>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sites Criados</p>
                  <p className="text-2xl font-bold">{loading ? "..." : sites.length}</p>
                </div>
                <Globe className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sites Ativos</p>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : sites.filter(s => s.is_active).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Presentes Vendidos</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create New Site Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Seus Sites</h2>
          <Button className="gap-2" onClick={() => navigate('/layouts')}>
            <Plus className="h-4 w-4" />
            Criar Novo Site
          </Button>
        </div>

        {/* Sites List */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando seus sites...</p>
          </div>
        ) : sites.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum site criado ainda</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro site de presentes personalizado
              </p>
              <Button className="gap-2" onClick={() => navigate('/layouts')}>
                <Plus className="h-4 w-4" />
                Criar Primeiro Site
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <Card key={site.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{site.title}</CardTitle>
                    <Badge variant={site.is_active ? "default" : "secondary"}>
                      {site.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {site.description || "Sem descrição"}
                  </p>
                  <div className="mb-3 text-xs text-muted-foreground">
                    URL: {generateSiteUrl(site).replace(window.location.origin, "")}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 gap-1"
                      onClick={() => window.open(generateSiteUrl(site), '_blank')}
                    >
                      <Eye className="h-3 w-3" />
                      Ver
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={() => navigate(`/edit-site/${site.id}`)}
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteCreatorDashboard;