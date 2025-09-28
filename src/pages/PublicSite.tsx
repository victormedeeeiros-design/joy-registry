import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Home, Calendar, ExternalLink, Gift } from "lucide-react";

interface Site {
  id: string;
  title: string;
  description?: string;
  layout_id: string;
  creator_id: string;
  is_active: boolean;
  created_at: string;
  hero_images?: string[];
  story_images?: string[];
  story_text?: string;
}

interface SiteProduct {
  id: string;
  product_id: string;
  site_id: string;
  custom_name?: string;
  custom_description?: string;
  custom_image_url?: string;
  custom_price?: number;
  is_available: boolean;
  position: number;
}

const PublicSite = () => {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [products, setProducts] = useState<SiteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSite = async () => {
      if (!id) {
        setError("ID do site não encontrado");
        setLoading(false);
        return;
      }

      try {
        // Buscar dados do site
        const { data: siteData, error: siteError } = await supabase
          .from('sites')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (siteError) {
          if (siteError.code === 'PGRST116') {
            setError("Site não encontrado ou inativo");
          } else {
            setError("Erro ao carregar site");
          }
          setLoading(false);
          return;
        }

        setSite(siteData);

        // Buscar produtos do site
        const { data: productsData, error: productsError } = await supabase
          .from('site_products')
          .select('*')
          .eq('site_id', id)
          .eq('is_available', true)
          .order('position', { ascending: true });

        if (productsError) {
          console.error('Erro ao carregar produtos:', productsError);
        } else {
          setProducts(productsData || []);
        }

      } catch (error) {
        console.error('Erro inesperado:', error);
        setError("Erro inesperado ao carregar site");
      } finally {
        setLoading(false);
      }
    };

    loadSite();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando site...</p>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <Heart className="h-6 w-6" />
              Site não encontrado
            </CardTitle>
            <CardDescription>
              {error || "Não foi possível encontrar este site ou ele não está mais ativo."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const heroImage = site.hero_images && site.hero_images.length > 0 ? site.hero_images[0] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative h-[60vh] min-h-[500px] flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: heroImage 
            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroImage})`
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 50%, hsl(var(--accent)) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4 text-center z-10">
          <Badge variant="outline" className="mb-4 bg-white/10 text-white border-white/20">
            <Home className="h-4 w-4 mr-2" />
            {site.layout_id === 'cha-casa-nova' ? 'Chá de Casa Nova' : 'Celebração Especial'}
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
            {site.title}
          </h1>
          
          {site.description && (
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90 drop-shadow-md">
              {site.description}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              <Gift className="h-5 w-5 mr-2" />
              Ver Lista de Presentes
            </Button>
          </div>
        </div>
        
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
      </section>

      {/* Story Section */}
      {site.story_images && site.story_images.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Nossa História</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {site.story_text || "Momentos especiais que queremos compartilhar com vocês"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {site.story_images.slice(0, 8).map((image, index) => (
                <div 
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <img 
                    src={image} 
                    alt={`Momento especial ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Lista de Presentes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha um presente especial para nos ajudar nesta nova etapa
            </p>
          </div>

          {products.length === 0 ? (
            <Card className="max-w-md mx-auto text-center">
              <CardContent className="p-8">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Lista em construção</h3>
                <p className="text-muted-foreground text-sm">
                  A lista de presentes ainda está sendo preparada. Volte em breve!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-4">
                    {product.custom_image_url && (
                      <div className="aspect-square rounded-lg overflow-hidden mb-4">
                        <img 
                          src={product.custom_image_url} 
                          alt={product.custom_name || "Produto"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardTitle className="text-lg">
                      {product.custom_name || `Produto ${product.product_id}`}
                    </CardTitle>
                    {product.custom_description && (
                      <CardDescription className="text-sm">
                        {product.custom_description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      {product.custom_price && (
                        <div className="text-lg font-semibold text-primary">
                          R$ {product.custom_price.toFixed(2).replace('.', ',')}
                        </div>
                      )}
                      <Button size="sm" className="ml-auto">
                        <Gift className="h-4 w-4 mr-2" />
                        Presentear
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Site criado com ❤️ para {site.title}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by Lista de Presentes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicSite;