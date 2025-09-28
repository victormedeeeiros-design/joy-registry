import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Home, Calendar, ExternalLink, Gift, User, ShoppingCart, BookOpen } from "lucide-react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CartSidebar } from "@/components/CartSidebar";
import { CartProvider, useCart } from "@/hooks/useCart";

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

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: string;
}

const PublicSiteContent = () => {

  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [products, setProducts] = useState<SiteProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('home');
  const { addItem } = useCart();
  const navigate = useNavigate();

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

        // Buscar todos os produtos disponíveis
        const { data: allProductsData, error: allProductsError } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active');

        if (allProductsError) {
          console.error('Erro ao carregar produtos gerais:', allProductsError);
        } else {
          setAllProducts(allProductsData || []);
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

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-script text-xl text-primary">{site.title}</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Button 
                variant="ghost" 
                className={activeSection === 'home' ? 'text-primary' : ''}
                onClick={() => scrollToSection('home')}
              >
                <Home className="h-4 w-4 mr-2" />
                Início
              </Button>
              <Button 
                variant="ghost"
                className={activeSection === 'story' ? 'text-primary' : ''}
                onClick={() => scrollToSection('story')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Nossa História
              </Button>
              <Button 
                variant="ghost"
                className={activeSection === 'gifts' ? 'text-primary' : ''}
                onClick={() => scrollToSection('gifts')}
              >
                <Gift className="h-4 w-4 mr-2" />
                Lista de Presentes
              </Button>
            </nav>

            <div className="flex items-center gap-3">
              <CartSidebar />
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <HeroCarousel
        images={site.hero_images || []}
        className="h-[70vh] min-h-[600px] flex items-center justify-center text-white"
      >
        <section id="home" className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-white/10 text-white border-white/20">
            <Home className="h-4 w-4 mr-2" />
            {site.layout_id === 'cha-casa-nova' ? 'Chá de Casa Nova' : 'Celebração Especial'}
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-script mb-6 text-white drop-shadow-lg">
            {site.title}
          </h1>
          
          {site.description && (
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90 drop-shadow-md">
              {site.description}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => scrollToSection('gifts')}
            >
              <Gift className="h-5 w-5 mr-2" />
              Ver Lista de Presentes
            </Button>
          </div>
        </section>
      </HeroCarousel>

      {/* Story Section */}
      {site.story_images && site.story_images.length > 0 && (
        <section id="story" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-script mb-4">Nossa História</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {site.story_text || "Momentos especiais que queremos compartilhar com vocês"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {site.story_images.slice(0, 8).map((image, index) => (
                <div 
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-300"
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
      <section id="gifts" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-script mb-4">Lista de Presentes</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha um presente especial para nos ajudar nesta nova etapa
            </p>
          </div>

          {allProducts.length === 0 ? (
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
              {allProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-elegant transition-all duration-300 group">
                  <CardHeader className="p-4">
                    {product.image_url && (
                      <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-muted">
                        <div className="w-full h-full flex items-center justify-center">
                          <Gift className="h-16 w-16 text-muted-foreground/50" />
                        </div>
                      </div>
                    )}
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    {product.description && (
                      <CardDescription className="text-sm">
                        {product.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-primary">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddToCart(product)}
                        className="ml-auto"
                      >
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
            Site criado com ❤️ para <span className="font-script text-primary">{site.title}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by Lista de Presentes
          </p>
        </div>
      </footer>
    </div>
  );
};

const PublicSite = () => {
  return (
    <CartProvider>
      <PublicSiteContent />
    </CartProvider>
  );
};

export default PublicSite;