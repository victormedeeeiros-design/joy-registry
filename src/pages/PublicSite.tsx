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

// Product images (ESM imports ensure correct URLs in build)
import stoveImg from "@/assets/products/stove.jpg";
import microwaveImg from "@/assets/products/microwave.jpg";
import blenderImg from "@/assets/products/blender.jpg";
import mixerImg from "@/assets/products/mixer.jpg";
import electricOvenImg from "@/assets/products/electric-oven.jpg";
import airFryerImg from "@/assets/products/air-fryer.jpg";
import grillImg from "@/assets/products/grill.jpg";
import rangeHoodImg from "@/assets/products/range-hood.jpg";

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
  event_date?: string;
  event_time?: string;
  event_location?: string;
  color_scheme?: string;
  font_family?: string;
  font_color_menu?: string;
  font_color_hero?: string;
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
  product?: Product | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: string;
}

const DEFAULT_CATALOG: Record<string, Array<{ id: string; name: string; price: number; image_url: string; description?: string; category?: string }>> = {
  'cha-casa-nova': [
    { id: 'stove', name: 'Fogão', price: 1299.9, image_url: stoveImg, category: 'Eletrodomésticos', description: 'Fogão 4 bocas com forno' },
    { id: 'microwave', name: 'Micro-ondas', price: 599.9, image_url: microwaveImg, category: 'Eletrodomésticos', description: 'Micro-ondas 20 litros' },
    { id: 'blender', name: 'Liquidificador', price: 199.9, image_url: blenderImg, category: 'Eletrodomésticos', description: 'Liquidificador 3 velocidades' },
    { id: 'mixer', name: 'Batedeira', price: 349.9, image_url: mixerImg, category: 'Eletrodomésticos', description: 'Batedeira planetária' },
    { id: 'electric-oven', name: 'Forno Elétrico', price: 899.9, image_url: electricOvenImg, category: 'Eletrodomésticos', description: 'Forno elétrico 45 litros' },
    { id: 'air-fryer', name: 'Air Fryer', price: 499.9, image_url: airFryerImg, category: 'Eletrodomésticos', description: 'Fritadeira sem óleo 4L' },
    { id: 'grill', name: 'Grill Elétrico', price: 279.9, image_url: grillImg, category: 'Eletrodomésticos', description: 'Grill elétrico antiaderente' },
    { id: 'range-hood', name: 'Coifa', price: 799.9, image_url: rangeHoodImg, category: 'Eletrodomésticos', description: 'Coifa 60cm inox' },
    { id: 'kit-sobrevivencia', name: 'Kit sobrevivência do merecedor novo', price: 80.00, image_url: '', category: 'Brincadeiras', description: 'Kit divertido para novos moradores' },
    { id: 'pano-motivacional', name: 'Pano de prato motivacional', price: 35.00, image_url: '', category: 'Brincadeiras', description: 'Pano de prato com frases motivacionais' },
    { id: 'tapete-diferentao', name: 'Tapete de porta diferentão', price: 65.00, image_url: '', category: 'Brincadeiras', description: 'Tapete com mensagens divertidas' },
    { id: 'manual-sobrevivencia', name: 'Manual de sobrevivência doméstica', price: 45.00, image_url: '', category: 'Brincadeiras', description: 'Guia humorístico para vida doméstica' }
  ],
};

const PublicSiteContent = () => {

  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [products, setProducts] = useState<SiteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('home');
  const { addItem } = useCart();
  const navigate = useNavigate();

  const getProductImageFallback = (productId: string) => {
    const imageMap: { [key: string]: string } = {
      'microwave': microwaveImg,
      'range-hood': rangeHoodImg,
      'grill': grillImg,
      'blender': blenderImg,
      'mixer': mixerImg,
      'electric-oven': electricOvenImg,
      'air-fryer': airFryerImg,
      'stove': stoveImg
    };
    return imageMap[productId] || undefined;
  };

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

        // Apply theme class based on color scheme
        const body = document.body;
        body.className = body.className.replace(/theme-[\w-]+/g, '');
        if (siteData.color_scheme === 'dark-elegance') {
          body.classList.add('theme-dark-elegance');
        } else if (siteData.color_scheme === 'midnight-black') {
          body.classList.add('theme-midnight-black');
        }
        
        // Apply font colors if specified
        const root = document.documentElement;
        
        // Menu font color
        if (siteData.font_color_menu && siteData.font_color_menu !== 'default') {
          const menuColorMap: { [key: string]: string } = {
            'primary': 'var(--primary)',
            'secondary': 'var(--muted-foreground)',
            'accent': 'var(--accent-foreground)',
            'white': '#ffffff',
            'black': '#000000',
            'gold': '#D4AF37',
            'rose': '#E91E63'
          };
          
          if (menuColorMap[siteData.font_color_menu]) {
            root.style.setProperty('--menu-color', menuColorMap[siteData.font_color_menu]);
          }
        }
        
        // Hero font color
        if (siteData.font_color_hero && siteData.font_color_hero !== 'white') {
          const heroColorMap: { [key: string]: string } = {
            'white': '#ffffff',
            'black': '#000000',
            'gold': '#D4AF37',
            'cream': '#F5F5DC',
            'navy': '#1e3a8a',
            'emerald': '#059669',
            'rose': '#E91E63',
            'purple': '#7c3aed'
          };
          
          if (heroColorMap[siteData.font_color_hero]) {
            root.style.setProperty('--hero-color', heroColorMap[siteData.font_color_hero]);
          }
        }

        // Buscar produtos do site com dados dos produtos
        const { data: siteProductsData, error: siteProductsError } = await supabase
          .from('site_products')
          .select('*')
          .eq('site_id', id)
          .eq('is_available', true)
          .order('position', { ascending: true });

        if (siteProductsError) {
          console.error('Erro ao carregar produtos:', siteProductsError);
        } else if (siteProductsData && siteProductsData.length > 0) {
          const productIds = siteProductsData.map(sp => sp.product_id);
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds)
            .eq('status', 'active');
          if (productsError) {
            console.error('Erro ao carregar dados dos produtos:', productsError);
          } else {
            const combinedData = siteProductsData.map(siteProduct => ({
              ...siteProduct,
              product: productsData?.find(p => p.id === siteProduct.product_id) || null
            }));
            setProducts(combinedData);
          }
        } else {
          // Fallback: usar catálogo padrão por layout quando não há produtos no banco
          const catalog = DEFAULT_CATALOG[siteData.layout_id] || DEFAULT_CATALOG['cha-casa-nova'];
          const fallback = (catalog || []).map((p, idx) => ({
            id: `fallback-${p.id}`,
            product_id: p.id,
            site_id: siteData.id,
            custom_name: p.name,
            custom_description: p.description,
            custom_image_url: p.image_url,
            custom_price: p.price,
            is_available: true,
            position: idx + 1,
            product: {
              id: p.id,
              name: p.name,
              price: p.price,
              image_url: p.image_url,
              description: p.description,
              category: p.category || 'Eletrodomésticos',
            } as Product
          }));
          setProducts(fallback);
        }

      } catch (error) {
        console.error('Erro inesperado:', error);
        setError("Erro inesperado ao carregar site");
      } finally {
        setLoading(false);
      }
    };

    loadSite();

    // Cleanup: restore default theme when leaving the page
    return () => {
      const body = document.body;
      body.className = body.className.replace(/theme-[\w-]+/g, '');
      
      // Reset font colors to default
      const root = document.documentElement;
      root.style.removeProperty('--menu-color');
      root.style.removeProperty('--hero-color');
    };
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

  const handleAddToCart = (siteProduct: SiteProduct) => {
    if (!siteProduct.product) return;
    
    const name = siteProduct.custom_name || siteProduct.product.name;
    const price = siteProduct.custom_price || siteProduct.product.price;
    const image = siteProduct.custom_image_url || siteProduct.product.image_url;
    
    addItem({
      id: siteProduct.id,
      name,
      price,
      image
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCreatePayment = async (items: Array<{ id?: string; quantity: number; name?: string; price?: number; description?: string; image_url?: string }>) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          items,
          siteId: site?.id
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
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
            
            <nav className="hidden md:flex items-center gap-6" style={{ color: 'var(--menu-color, var(--foreground))' }}>
              <Button 
                variant="ghost" 
                className={`${activeSection === 'home' ? 'text-primary' : ''} hover:text-primary transition-colors`}
                onClick={() => scrollToSection('home')}
                style={{ color: 'inherit' }}
              >
                <Home className="h-4 w-4 mr-2" />
                Início
              </Button>
              <Button 
                variant="ghost"
                className={`${activeSection === 'story' ? 'text-primary' : ''} hover:text-primary transition-colors`}
                onClick={() => scrollToSection('story')}
                style={{ color: 'inherit' }}
              >
                <Heart className="h-4 w-4 mr-2" />
                Nossa História
              </Button>
              <Button 
                variant="ghost"
                className={`${activeSection === 'gifts' ? 'text-primary' : ''} hover:text-primary transition-colors`}
                onClick={() => scrollToSection('gifts')}
                style={{ color: 'inherit' }}
              >
                <Gift className="h-4 w-4 mr-2" />
                Lista de Presentes
              </Button>
            </nav>

            <div className="flex items-center gap-3">
              <CartSidebar siteId={site.id} />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/guest-login?siteId=${site.id}`)}
              >
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
        className="h-[85vh] min-h-[700px] flex items-center justify-center text-white"
      >
        <section id="home" className="container mx-auto px-4 text-center" style={{ color: 'var(--hero-color, #ffffff)' }}>
          <Badge variant="outline" className="mb-4 bg-white/10 border-white/20" style={{ color: 'inherit' }}>
            <Home className="h-4 w-4 mr-2" />
            {site.layout_id === 'cha-casa-nova' ? 'Chá de Casa Nova' : 'Celebração Especial'}
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-script mb-6 drop-shadow-lg" style={{ color: 'inherit' }}>
            {site.title}
          </h1>
          
          {site.description && (
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 drop-shadow-md" style={{ color: 'inherit' }}>
              {site.description}
            </p>
          )}
          
          {/* Event Information */}
          {(site.event_date || site.event_time || site.event_location) && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Calendar className="h-5 w-5" style={{ color: 'inherit' }} />
                <h3 className="text-lg font-semibold" style={{ color: 'inherit' }}>Informações do Evento</h3>
              </div>
              <div className="space-y-2 opacity-90" style={{ color: 'inherit' }}>
                {site.event_date && (
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(site.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                {site.event_time && (
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{site.event_time}</span>
                  </div>
                )}
                {site.event_location && (
                  <div className="flex items-center justify-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>{site.event_location}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => navigate(`/guest-login?siteId=${site.id}&rsvp=yes`)}
            >
              <Heart className="h-5 w-5 mr-2" />
              Vou comparecer
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => navigate(`/guest-login?siteId=${site.id}&rsvp=no`)}
            >
              Não poderei comparecer
            </Button>
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
      <section id="story" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-script mb-6 text-foreground">Nossa História</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Um amor que encontrou seu lar
            </p>
          </div>
          
          {site.story_images && site.story_images.length > 0 ? (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-elegant p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {/* Text Content */}
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Home className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-playfair font-semibold text-foreground">O Início de Tudo</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {site.story_text || "Há alguns anos, duas vidas se encontraram e descobriram que juntas formavam algo muito especial. Após muitos momentos compartilhados, risadas, sonhos e planos, chegou o momento de dar o próximo grande passo: construir um lar juntos."}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Home className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-playfair font-semibold text-foreground">Nossa Nova Casa</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Agora, com as chaves da nossa primeira casa em mãos, queremos compartilhar esta alegria com vocês, pessoas especiais que fazem parte da nossa jornada.
                      </p>
                    </div>
                  </div>
                  
                  {/* Image */}
                  <div className="relative">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-soft">
                      <img 
                        src={site.story_images[0]} 
                        alt="Nossa história"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {site.story_images.length > 1 && (
                      <div className="absolute -bottom-4 -right-4 grid grid-cols-3 gap-2">
                        {site.story_images.slice(1, 4).map((image, index) => (
                          <div 
                            key={index}
                            className="w-16 h-16 rounded-lg overflow-hidden shadow-soft border-2 border-white"
                          >
                            <img 
                              src={image} 
                              alt={`Momento ${index + 2}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-elegant p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Home className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-playfair font-semibold text-foreground">O Início de Tudo</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Há alguns anos, duas vidas se encontraram e descobriram que juntas formavam algo muito especial. Após muitos momentos compartilhados, risadas, sonhos e planos, chegou o momento de dar o próximo grande passo: construir um lar juntos.
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Home className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-playfair font-semibold text-foreground">Nossa Nova Casa</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Agora, com as chaves da nossa primeira casa em mãos, queremos compartilhar esta alegria com vocês, pessoas especiais que fazem parte da nossa jornada.
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center py-12">
                    <Heart className="h-24 w-24 text-primary/30 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Nossa história será contada aqui</h3>
                    <p className="text-muted-foreground">
                      Em breve compartilharemos nossos momentos especiais com vocês
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RSVP Section within Story */}
        <div className="container mx-auto px-4 mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-script mb-4">Confirmação de Presença</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Sua presença é muito importante para nós! Por favor, confirme sua participação.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Button 
              size="lg" 
              className="flex-1 w-full sm:w-auto"
              onClick={() => navigate(`/guest-login?siteId=${site.id}&rsvp=yes`)}
            >
              <Heart className="h-5 w-5 mr-2" />
              Vou comparecer
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1 w-full sm:w-auto"
              onClick={() => navigate(`/guest-login?siteId=${site.id}&rsvp=no`)}
            >
              Não poderei comparecer
            </Button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="gifts" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-script mb-6">Lista de Presentes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
            (() => {
              // Group products by category
              const categorizedProducts = products.reduce((acc, siteProduct) => {
                if (!siteProduct.product) return acc;
                
                const category = siteProduct.product.category || 'Eletrodomésticos';
                if (!acc[category]) {
                  acc[category] = [];
                }
                acc[category].push(siteProduct);
                return acc;
              }, {} as Record<string, typeof products>);

              return Object.entries(categorizedProducts).map(([category, categoryProducts]) => (
                <div key={category} className="mb-16">
                  {/* Category Header */}
                  <div className="text-center mb-10">
                    <h3 className="text-2xl font-playfair font-semibold text-foreground mb-2">{category}</h3>
                    <div className="w-24 h-0.5 bg-primary mx-auto"></div>
                  </div>
                  
                  {/* Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {categoryProducts.map((siteProduct) => {
                      const product = siteProduct.product;
                      if (!product) return null;
                      
                      const name = siteProduct.custom_name || product.name;
                      const price = siteProduct.custom_price || product.price;
                      const image = siteProduct.custom_image_url || product.image_url || getProductImageFallback(product.id);
                      const description = siteProduct.custom_description || product.description;
                      
                      return (
                        <Card key={siteProduct.id} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden border-0 shadow-soft">
                          <div className="aspect-square overflow-hidden bg-muted/20">
                            {image ? (
                              <img
                                src={image}
                                alt={name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Gift className="h-16 w-16 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-playfair font-semibold text-lg leading-tight text-foreground">{name}</h3>
                              <Badge variant="secondary" className="text-xs">{category}</Badge>
                            </div>
                            {description && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{description}</p>
                            )}
                            <div className="mb-6">
                              <span className="text-2xl font-bold text-primary">
                                R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="space-y-3">
                              <Button
                                variant="outline"
                                size="lg"
                                className="w-full h-12 border-primary/20 hover:border-primary hover:bg-primary/5"
                                onClick={() => handleAddToCart(siteProduct)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Adicionar à Lista
                              </Button>
                              <Button
                                size="lg"
                                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                onClick={() => handleCreatePayment([{
                                  id: siteProduct.id,
                                  quantity: 1,
                                  name,
                                  price,
                                  description,
                                  image_url: image
                                }])}
                              >
                                <Gift className="h-4 w-4 mr-2" />
                                Presentear
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ));
            })()
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