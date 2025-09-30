import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Home, Calendar, ExternalLink, Gift, User, ShoppingCart, BookOpen, LogOut, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CartSidebar } from "@/components/CartSidebar";
import { CartProvider, useCart } from "@/hooks/useCart";
import { useSiteAuth } from "@/hooks/useSiteAuth";
import { useToast } from "@/hooks/use-toast";

// Product images (ESM imports ensure correct URLs in build)
import stoveImg from "@/assets/products/stove.jpg";
import microwaveImg from "@/assets/products/microwave.jpg";
import blenderImg from "@/assets/products/blender.jpg";
import mixerImg from "@/assets/products/mixer.jpg";
import electricOvenImg from "@/assets/products/electric-oven.jpg";
import airFryerImg from "@/assets/products/air-fryer.jpg";
import grillImg from "@/assets/products/grill.jpg";
import rangeHoodImg from "@/assets/products/range-hood.jpg";
import { RSVPSection } from "@/components/RSVPSection";

interface Site {
  id: string;
  slug?: string;
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
  title_color?: string;
  section_title_1?: string;
  section_title_2?: string;
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
  'modern-grid': [
    { id: 'laptop', name: 'Notebook', price: 2499.9, image_url: '', category: 'Tecnologia', description: 'Notebook para trabalho' },
    { id: 'monitor', name: 'Monitor', price: 899.9, image_url: '', category: 'Tecnologia', description: 'Monitor 24 polegadas' },
    { id: 'headphones', name: 'Fones de Ouvido', price: 299.9, image_url: '', category: 'Tecnologia', description: 'Fones de ouvido premium' },
    { id: 'smartphone', name: 'Smartphone', price: 1599.9, image_url: '', category: 'Tecnologia', description: 'Smartphone top de linha' }
  ],
  'story-driven': [
    { id: 'camera', name: 'Câmera Digital', price: 1899.9, image_url: '', category: 'Fotografia', description: 'Câmera para capturar momentos' },
    { id: 'photo-album', name: 'Álbum de Fotos', price: 89.9, image_url: '', category: 'Fotografia', description: 'Álbum para guardar memórias' },
    { id: 'frame', name: 'Porta Retratos', price: 45.9, image_url: '', category: 'Decoração', description: 'Porta retratos elegante' },
    { id: 'diary', name: 'Diário', price: 65.9, image_url: '', category: 'Pessoal', description: 'Diário para registrar histórias' }
  ],
  'minimal-elegant': [
    { id: 'vase', name: 'Vaso Decorativo', price: 149.9, image_url: '', category: 'Decoração', description: 'Vaso minimalista' },
    { id: 'candle', name: 'Vela Aromática', price: 39.9, image_url: '', category: 'Decoração', description: 'Vela com aroma relaxante' },
    { id: 'book', name: 'Livro de Arte', price: 89.9, image_url: '', category: 'Literatura', description: 'Livro de arte moderna' },
    { id: 'plant', name: 'Planta Decorativa', price: 59.9, image_url: '', category: 'Natureza', description: 'Planta para decoração' }
  ]
};

const PublicSiteContent = () => {

  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [products, setProducts] = useState<SiteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSlideShowPaused, setIsSlideShowPaused] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { siteUser, signOut } = useSiteAuth();
  const { toast } = useToast();

  const getProductImageFallback = (productId: string, productName?: string) => {
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
    
    // Try exact match first
    if (imageMap[productId]) {
      return imageMap[productId];
    }
    
    // Try partial matches for UUIDs or different naming conventions
    for (const key in imageMap) {
      if (productId.toLowerCase().includes(key) || key.includes(productId.toLowerCase())) {
        return imageMap[key];
      }
    }
    
    // Try matching by product name if available
    if (productName) {
      const name = productName.toLowerCase();
      if (name.includes('micro') || name.includes('ondas')) return microwaveImg;
      if (name.includes('coifa')) return rangeHoodImg;
      if (name.includes('grill') || name.includes('churrasco')) return grillImg;
      if (name.includes('liquidificador') || name.includes('blender')) return blenderImg;
      if (name.includes('batedeira') || name.includes('mixer')) return mixerImg;
      if (name.includes('forno') && name.includes('elétrico')) return electricOvenImg;
      if (name.includes('air') && name.includes('fryer')) return airFryerImg;
      if (name.includes('fogão') || name.includes('stove')) return stoveImg;
    }
    
    return undefined;
  };

  useEffect(() => {
    const loadSite = async () => {
      const siteIdentifier = slug || id;
      if (!siteIdentifier) {
        setError("Identificador do site não encontrado");
        setLoading(false);
        return;
      }

      try {
        // Buscar dados do site - primeiro por slug, depois por ID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(siteIdentifier);
        
        const { data: siteData, error: siteError } = await supabase
          .from('sites')
          .select('*')
          .eq(isUUID ? 'id' : 'slug', siteIdentifier)
          .eq('is_active', true)
          .single() as { data: any; error: any };

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
        console.log('Site data loaded:', siteData);

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
        
        // Title color for sections
        if (siteData.title_color && siteData.title_color !== 'default') {
          const titleColorMap: { [key: string]: string } = {
            'primary': 'var(--primary)',
            'secondary': 'var(--muted-foreground)',
            'accent': 'var(--accent-foreground)',
            'white': '#ffffff',
            'black': '#000000',
            'gold': '#D4AF37',
            'rose': '#E91E63',
            'cream': '#F5F5DC',
            'navy': '#1e3a8a',
            'emerald': '#059669',
            'purple': '#7c3aed',
            'brown': '#8B4513',
            'teal': '#008080',
            'coral': '#FF6B6B',
            'indigo': '#6366F1',
            'orange': '#FF8C00',
            'pink': '#FF69B4',
            'mint': '#00CED1',
            'burgundy': '#800020'
          };
          
          if (titleColorMap[siteData.title_color]) {
            root.style.setProperty('--title-color', titleColorMap[siteData.title_color]);
          }
        } else {
          // Se não há cor específica definida, usar cor contrastante baseada no tema
          if (siteData.color_scheme === 'dark-elegance' || siteData.color_scheme === 'midnight-black') {
            root.style.setProperty('--title-color', '#ffffff');
          } else {
            root.style.setProperty('--title-color', 'var(--foreground)');
          }
        }
        
        // Garantir que o menu tenha contraste adequado
        if (!siteData.font_color_menu || siteData.font_color_menu === 'default') {
          if (siteData.color_scheme === 'dark-elegance' || siteData.color_scheme === 'midnight-black') {
            root.style.setProperty('--menu-color', '#ffffff');
          } else {
            root.style.setProperty('--menu-color', 'var(--foreground)');
          }
        }

        // Buscar produtos do site com dados dos produtos
        const { data: siteProductsData, error: siteProductsError } = await supabase
          .from('site_products')
          .select('*')
          .eq('site_id', siteData.id)
          .eq('is_available', true)
          .order('position', { ascending: true });

        if (siteProductsError) {
          console.error('Erro ao carregar produtos:', siteProductsError);
        } else if (siteProductsData && siteProductsData.length > 0) {
          console.log('Site products found:', siteProductsData.length, siteProductsData);
          const productIds = siteProductsData.map(sp => sp.product_id);
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds)
            .eq('status', 'active');
          if (productsError) {
            console.error('Erro ao carregar dados dos produtos:', productsError);
          } else {
            console.log('Products data found:', productsData?.length, productsData);
            const combinedData = siteProductsData.map(siteProduct => ({
              ...siteProduct,
              product: productsData?.find(p => p.id === siteProduct.product_id) || null
            }));
            console.log('Combined products data:', combinedData.length, combinedData);
            setProducts(combinedData);
          }
        } else {
          console.log('No site products found, using fallback catalog');
          
          // Tentar buscar produtos da tabela products primeiro para usar o catálogo completo
          const { data: allProducts, error: allProductsError } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active')
            .limit(12);

          if (!allProductsError && allProducts && allProducts.length > 0) {
            console.log('Using products from database:', allProducts.length);
            const fallbackFromDb = allProducts.map((p, idx) => ({
              id: `db-fallback-${p.id}`,
              product_id: p.id,
              site_id: siteData.id,
              custom_name: null,
              custom_description: null,
              custom_image_url: null,
              custom_price: null,
              is_available: true,
              position: idx + 1,
              product: p
            }));
            setProducts(fallbackFromDb);
          } else {
            // Fallback final: usar catálogo padrão por layout quando não há produtos no banco
            console.log('Using hardcoded catalog fallback');
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
      root.style.removeProperty('--title-color');
    };
  }, [slug, id]);

  // Auto slideshow for story images
  useEffect(() => {
    if (site?.story_images && site.story_images.length > 1 && !isSlideShowPaused) {
      const imagesLength = site.story_images.length;
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => 
          (prev + 1) % imagesLength
        );
      }, 4000); // Change image every 4 seconds

      return () => clearInterval(interval);
    }
  }, [site?.story_images, isSlideShowPaused]);

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

  const nextImage = () => {
    if (site?.story_images && site.story_images.length > 0) {
      const imagesLength = site.story_images.length;
      setCurrentImageIndex((prev) => 
        (prev + 1) % imagesLength
      );
      setIsSlideShowPaused(true);
      setTimeout(() => setIsSlideShowPaused(false), 8000); // Resume after 8 seconds
    }
  };

  const previousImage = () => {
    if (site?.story_images && site.story_images.length > 0) {
      const imagesLength = site.story_images.length;
      setCurrentImageIndex((prev) => 
        prev === 0 ? imagesLength - 1 : prev - 1
      );
      setIsSlideShowPaused(true);
      setTimeout(() => setIsSlideShowPaused(false), 8000); // Resume after 8 seconds
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
      <header className={`sticky top-0 z-50 backdrop-blur-sm border-b ${
        site.color_scheme === 'dark-elegance' || site.color_scheme === 'midnight-black' 
          ? 'bg-black/95 border-white/10' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span 
                className="font-script text-sm sm:text-lg md:text-xl font-semibold truncate max-w-[180px] block" 
                title={site.title}
                style={{ 
                  color: site.color_scheme === 'dark-elegance' || site.color_scheme === 'midnight-black'
                    ? 'var(--menu-color, #ffffff)'
                    : 'var(--menu-color, var(--foreground))'
                }}
              >
                {site.title}
              </span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Button 
                variant="ghost" 
                className={`${activeSection === 'home' ? 'text-primary' : ''} hover:text-primary transition-colors`}
                onClick={() => scrollToSection('home')}
                style={{ 
                  color: site.color_scheme === 'dark-elegance' || site.color_scheme === 'midnight-black'
                    ? 'var(--menu-color, #ffffff)'
                    : 'var(--menu-color, var(--foreground))'
                }}
              >
                <Home className="h-4 w-4 mr-2" />
                Início
              </Button>
              <Button 
                variant="ghost"
                className={`${activeSection === 'story' ? 'text-primary' : ''} hover:text-primary transition-colors`}
                onClick={() => scrollToSection('story')}
                style={{ 
                  color: site.color_scheme === 'dark-elegance' || site.color_scheme === 'midnight-black'
                    ? 'var(--menu-color, #ffffff)'
                    : 'var(--menu-color, var(--foreground))'
                }}
              >
                <Heart className="h-4 w-4 mr-2" />
                Nossa História
              </Button>
              <Button 
                variant="ghost"
                className={`${activeSection === 'gifts' ? 'text-primary' : ''} hover:text-primary transition-colors`}
                onClick={() => scrollToSection('gifts')}
                style={{ 
                  color: site.color_scheme === 'dark-elegance' || site.color_scheme === 'midnight-black'
                    ? 'var(--menu-color, #ffffff)'
                    : 'var(--menu-color, var(--foreground))'
                }}
              >
                <Gift className="h-4 w-4 mr-2" />
                Lista de Presentes
              </Button>
            </nav>

            <div className="flex items-center gap-3">
              {/* Botão rápido para Lista de Presentes no mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => {
                  const element = document.getElementById('gifts');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                style={{ 
                  color: site.color_scheme === 'dark-elegance' || site.color_scheme === 'midnight-black'
                    ? 'var(--menu-color, #ffffff)'
                    : 'var(--menu-color, var(--foreground))'
                }}
              >
                <Gift className="h-4 w-4" />
              </Button>
              
              <CartSidebar siteId={site.id} />
              {siteUser ? (
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Olá, </span>
                    <span className="font-medium">{siteUser.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={async () => {
                      await signOut();
                      toast({
                        title: "Logout realizado",
                        description: "Você foi desconectado com sucesso.",
                      });
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    localStorage.setItem('currentSiteId', site.id);
                    navigate(`/guest-login?siteId=${site.id}`);
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <HeroCarousel
        images={site.hero_images || []}
        imageFit={(site as any).hero_image_fit || 'cover'}
        className="h-[85vh] min-h-[700px] flex items-center justify-center text-white"
      >
        <section id="home" className="container mx-auto px-4 text-center" style={{ color: 'var(--hero-color, #ffffff)' }}>
          <Badge variant="outline" className="mb-4 bg-white/10 border-white/20" style={{ color: 'inherit' }}>
            <Home className="h-4 w-4 mr-2" />
            {site.layout_id === 'cha-casa-nova' ? 'Chá de Casa Nova' : 'Celebração Especial'}
          </Badge>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-script mb-6 drop-shadow-lg text-center px-4" style={{ color: 'var(--title-color, var(--hero-color, #ffffff))' }}>
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
              onClick={() => {
                localStorage.setItem('currentSiteId', site.id);
                navigate(`/guest-login?siteId=${site.id}&rsvp=yes`);
              }}
            >
              <Heart className="h-5 w-5 mr-2" />
              Vou comparecer
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => {
                localStorage.setItem('currentSiteId', site.id);
                navigate(`/guest-login?siteId=${site.id}&rsvp=no`);
              }}
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
            <h2 className="text-4xl font-script mb-6" style={{ color: 'var(--title-color, var(--foreground))' }}>Nossa História</h2>
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
                        <h3 className="text-2xl font-playfair font-semibold" style={{ color: 'var(--title-color, var(--foreground))' }}>
                          {site.section_title_1 || "O Início de Tudo"}
                        </h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {site.story_text || "Há alguns anos, duas vidas se encontraram e descobriram que juntas formavam algo muito especial. Após muitos momentos compartilhados, risadas, sonhos e planos, chegou o momento de dar o próximo grande passo: construir um lar juntos."}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Home className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-playfair font-semibold" style={{ color: 'var(--title-color, var(--foreground))' }}>
                          {site.section_title_2 || "Nossa Nova Casa"}
                        </h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Agora, com as chaves da nossa primeira casa em mãos, queremos compartilhar esta alegria com vocês, pessoas especiais que fazem parte da nossa jornada.
                      </p>
                    </div>
                  </div>
                  
                  {/* Image Slideshow */}
                  <div className="relative">
                    <div className="aspect-[5/4] rounded-xl overflow-hidden shadow-soft relative">
                      {site.story_images.map((image, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <img 
                            src={image} 
                            alt={`Nossa história - ${index + 1}`}
                            className={`w-full h-full ${
                              (site as any).story_image_fit === 'cover' ? 'object-cover' :
                              (site as any).story_image_fit === 'contain' ? 'object-contain bg-muted' : 
                              'object-fill'
                            }`}
                          />
                        </div>
                      ))}
                      
                      {/* Navigation arrows */}
                      {site.story_images.length > 1 && (
                        <>
                          <button
                            onClick={previousImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                            aria-label="Imagem anterior"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                            aria-label="Próxima imagem"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      
                      {/* Indicators */}
                      {site.story_images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {site.story_images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === currentImageIndex 
                                  ? 'bg-white shadow-lg' 
                                  : 'bg-white/50 hover:bg-white/80'
                              }`}
                              aria-label={`Ir para imagem ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Image counter */}
                      {site.story_images.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {site.story_images.length}
                        </div>
                      )}
                    </div>
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
                        <h3 className="text-2xl font-playfair font-semibold" style={{ color: 'var(--title-color, var(--foreground))' }}>
                          {site.section_title_1 || "O Início de Tudo"}
                        </h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        Há alguns anos, duas vidas se encontraram e descobriram que juntas formavam algo muito especial. Após muitos momentos compartilhados, risadas, sonhos e planos, chegou o momento de dar o próximo grande passo: construir um lar juntos.
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Home className="h-6 w-6 text-primary" />
                        <h3 className="text-2xl font-playfair font-semibold" style={{ color: 'var(--title-color, var(--foreground))' }}>
                          {site.section_title_2 || "Nossa Nova Casa"}
                        </h3>
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
        <RSVPSection site={site} siteUser={siteUser} navigate={navigate} />
      </section>

      {/* Products Section */}
      <section id="gifts" className="py-12 sm:py-20 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex items-center justify-center mb-4">
              <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-script text-center" style={{ color: 'var(--title-color, var(--foreground))' }}>Lista de Presentes</h2>
            </div>
            <div className="w-16 sm:w-24 h-1 bg-primary mx-auto mb-4"></div>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Escolha um presente especial para nos ajudar nesta nova etapa
            </p>
          </div>

          {/* Status info for mobile debugging */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs sm:text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              {products.length > 0 ? `${products.length} produtos disponíveis` : 'Carregando produtos...'}
            </div>
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
            <div className="space-y-8 sm:space-y-12">
              {/* Debug Section */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">🔍 Debug Info:</h3>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p><strong>Total de produtos:</strong> {products.length}</p>
                  <p><strong>Primeiro produto:</strong></p>
                  {products.length > 0 && (
                    <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(products[0], null, 2)}
                    </pre>
                  )}
                  <p><strong>Produtos têm .product?</strong> {products.length > 0 ? (products[0].product ? '✅ Sim' : '❌ Não') : 'N/A'}</p>
                  <p><strong>Site atual:</strong> {site?.slug || 'Carregando...'}</p>
                </div>
              </div>
              
              {/* Renderização direta dos produtos sem categorização */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {products.map((siteProduct, index) => {
                  console.log(`🔍 Produto ${index}:`, siteProduct);
                  
                  // Para produtos do banco: dados estão nas propriedades custom_*
                  // Para fallback: dados estão em siteProduct.product
                  const product = siteProduct.product;
                  
                  // Se não tem .product, usa os dados custom direto (produtos do banco)
                  if (!product) {
                    const name = siteProduct.custom_name || 'Produto sem nome';
                    const price = siteProduct.custom_price || 0;
                    const image = siteProduct.custom_image_url || '';
                    const description = siteProduct.custom_description || '';
                    const category = 'Geral';
                    
                    return (
                      <Card key={siteProduct.id || index} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden border shadow-sm">
                        <div className="w-full h-40 sm:h-48 overflow-hidden bg-muted/20 flex items-center justify-center">
                          {image ? (
                            <img
                              src={image}
                              alt={name}
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Gift className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-playfair font-semibold text-base sm:text-lg leading-tight text-foreground pr-2 flex-1">{name}</h3>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">{category}</Badge>
                          </div>
                          {description && (
                            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{description}</p>
                          )}
                          <div className="mb-4 sm:mb-6">
                            <span className="text-xl sm:text-2xl font-bold text-primary">
                              R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="space-y-2 sm:space-y-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-10 sm:h-12 border-primary/20 hover:border-primary hover:bg-primary/5 text-xs sm:text-sm"
                              onClick={() => handleAddToCart(siteProduct)}
                            >
                              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Adicionar à Lista
                            </Button>
                            <Button
                              size="sm"
                              className="w-full h-10 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm"
                              onClick={() => handleCreatePayment([{
                                id: siteProduct.id,
                                quantity: 1,
                                name,
                                price,
                                description,
                                image_url: image
                              }])}
                            >
                              <Gift className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Presentear
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  
                  // Se tem .product, usa a estrutura do fallback
                  const name = siteProduct.custom_name || product.name;
                  const price = siteProduct.custom_price || product.price || 0;
                  const image = siteProduct.custom_image_url || product.image_url || getProductImageFallback(product.id, product.name);
                  const description = siteProduct.custom_description || product.description;
                  const category = product.category || 'Geral';
                  
                  return (
                    <Card key={siteProduct.id || index} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden border shadow-sm">
                      <div className="w-full h-40 sm:h-48 overflow-hidden bg-muted/20 flex items-center justify-center">
                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Gift className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-playfair font-semibold text-base sm:text-lg leading-tight text-foreground pr-2 flex-1">{name}</h3>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">{category}</Badge>
                        </div>
                        {description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{description}</p>
                        )}
                        <div className="mb-4 sm:mb-6">
                          <span className="text-xl sm:text-2xl font-bold text-primary">
                            R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-10 sm:h-12 border-primary/20 hover:border-primary hover:bg-primary/5 text-xs sm:text-sm"
                            onClick={() => handleAddToCart(siteProduct)}
                          >
                            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Adicionar à Lista
                          </Button>
                          <Button
                            size="sm"
                            className="w-full h-10 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm"
                            onClick={() => handleCreatePayment([{
                              id: siteProduct.id,
                              quantity: 1,
                              name,
                              price,
                              description,
                              image_url: image
                            }])}
                          >
                            <Gift className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Presentear
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
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
            Powered by Amor&Presente® 
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