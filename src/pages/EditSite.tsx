import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { generateSiteUrl } from "@/lib/slug";
import { ArrowLeft, Save, Eye, Palette, Type, Package, Settings, Trash2, Plus, Edit, Users, Calendar, Loader2, Download } from "lucide-react";

// Product images for fallbacks
import stoveImg from "@/assets/products/stove.jpg";
import microwaveImg from "@/assets/products/microwave.jpg";
import blenderImg from "@/assets/products/blender.jpg";
import mixerImg from "@/assets/products/mixer.jpg";
import electricOvenImg from "@/assets/products/electric-oven.jpg";
import airFryerImg from "@/assets/products/air-fryer.jpg";
import grillImg from "@/assets/products/grill.jpg";
import rangeHoodImg from "@/assets/products/range-hood.jpg";
import { RSVPList } from "@/components/RSVPList";

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
  color_scheme?: string;
  font_family?: string;
  font_color_menu?: string;
  font_color_hero?: string;
  title_color?: string;
  section_title_1?: string;
  section_title_2?: string;
  event_date?: string;
  event_time?: string;
  event_location?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: string;
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

const colorSchemes = [
  { id: 'elegant-gold', name: 'Elegante Dourado', colors: ['#D4AF37', '#F5F5DC', '#8B4513'] },
  { id: 'romantic-pink', name: 'Rosa Romântico', colors: ['#FFB6C1', '#FFF0F5', '#8B4B61'] },
  { id: 'modern-blue', name: 'Azul Moderno', colors: ['#4A90E2', '#E8F4FD', '#2C5AA0'] },
  { id: 'natural-green', name: 'Verde Natural', colors: ['#90EE90', '#F0FFF0', '#228B22'] },
  { id: 'classic-navy', name: 'Azul Marinho Clássico', colors: ['#000080', '#F0F8FF', '#483D8B'] },
  { id: 'dark-elegance', name: 'Elegância Escura', colors: ['#1a1a1a', '#2d2d2d', '#f5f5f5'] },
  { id: 'midnight-black', name: 'Preto Midnight', colors: ['#000000', '#1c1c1c', '#ffffff'] }
];

const fontFamilies = [
  { id: 'inter', name: 'Inter (Moderna)', value: 'Inter, sans-serif' },
  { id: 'playfair', name: 'Playfair Display (Elegante)', value: 'Playfair Display, serif' },
  { id: 'dancing', name: 'Dancing Script (Manuscrita)', value: 'Dancing Script, cursive' },
  { id: 'sloop', name: 'Sloop Script Pro Bold', value: 'Tangerine, Dancing Script, cursive' },
  { id: 'tangerine', name: 'Tangerine Bold', value: 'Tangerine, cursive' },
  { id: 'montserrat', name: 'Montserrat (Clean)', value: 'Montserrat, sans-serif' }
];

const fontColors = [
  { id: 'default', name: 'Padrão', value: 'var(--foreground)' },
  { id: 'primary', name: 'Primária', value: 'var(--primary)' },
  { id: 'secondary', name: 'Secundária', value: 'var(--muted-foreground)' },
  { id: 'accent', name: 'Destaque', value: 'var(--accent-foreground)' },
  { id: 'white', name: 'Branco', value: '#ffffff' },
  { id: 'black', name: 'Preto', value: '#000000' },
  { id: 'gold', name: 'Dourado', value: '#D4AF37' },
  { id: 'rose', name: 'Rosa', value: '#E91E63' },
  { id: 'cream', name: 'Creme Suave', value: '#F5F5DC' },
  { id: 'navy', name: 'Azul Marinho', value: '#1e3a8a' },
  { id: 'emerald', name: 'Verde Esmeralda', value: '#059669' },
  { id: 'purple', name: 'Roxo Real', value: '#7c3aed' },
  { id: 'brown', name: 'Marrom Chocolate', value: '#8B4513' },
  { id: 'teal', name: 'Azul Petróleo', value: '#008080' },
  { id: 'coral', name: 'Coral', value: '#FF6B6B' },
  { id: 'indigo', name: 'Índigo', value: '#6366F1' },
  { id: 'orange', name: 'Laranja', value: '#FF8C00' },
  { id: 'pink', name: 'Rosa Claro', value: '#FF69B4' },
  { id: 'mint', name: 'Verde Menta', value: '#00CED1' },
  { id: 'burgundy', name: 'Borgonha', value: '#800020' }
];

const heroFontColors = [
  { id: 'white', name: 'Branco (contraste escuro)', value: '#ffffff' },
  { id: 'black', name: 'Preto (contraste claro)', value: '#000000' },
  { id: 'gold', name: 'Dourado Elegante', value: '#D4AF37' },
  { id: 'cream', name: 'Creme Suave', value: '#F5F5DC' },
  { id: 'navy', name: 'Azul Marinho', value: '#1e3a8a' },
  { id: 'emerald', name: 'Verde Esmeralda', value: '#059669' },
  { id: 'rose', name: 'Rosa Elegante', value: '#E91E63' },
  { id: 'purple', name: 'Roxo Real', value: '#7c3aed' }
];

const categories = [
  'Eletrodomésticos',
  'Mesa e Decoração', 
  'Brincadeiras',
  'Casa e Jardim',
  'Cozinha',
  'Quarto',
  'Banheiro',
  'Sala de Estar'
];

// Catálogo padrão para fallback
const DEFAULT_CATALOG_BY_LAYOUT: Record<string, Array<{ id: string; name: string; price: number; image_url: string; description?: string; category?: string }>> = {
  'cha-casa-nova': [
    { id: 'stove', name: 'Fogão', price: 1299.9, image_url: stoveImg, description: 'Fogão 4 bocas com forno', category: 'Eletrodomésticos' },
    { id: 'microwave', name: 'Micro-ondas', price: 599.9, image_url: microwaveImg, description: 'Micro-ondas 20 litros', category: 'Eletrodomésticos' },
    { id: 'blender', name: 'Liquidificador', price: 199.9, image_url: blenderImg, description: 'Liquidificador 3 velocidades', category: 'Eletrodomésticos' },
    { id: 'mixer', name: 'Batedeira', price: 349.9, image_url: mixerImg, description: 'Batedeira planetária', category: 'Eletrodomésticos' },
    { id: 'electric-oven', name: 'Forno Elétrico', price: 899.9, image_url: electricOvenImg, description: 'Forno elétrico 45 litros', category: 'Eletrodomésticos' },
    { id: 'air-fryer', name: 'Air Fryer', price: 499.9, image_url: airFryerImg, description: 'Fritadeira sem óleo 4L', category: 'Eletrodomésticos' },
    { id: 'grill', name: 'Grill Elétrico', price: 279.9, image_url: grillImg, description: 'Grill elétrico antiaderente', category: 'Eletrodomésticos' },
    { id: 'range-hood', name: 'Coifa', price: 799.9, image_url: rangeHoodImg, description: 'Coifa 60cm inox', category: 'Eletrodomésticos' }
  ],
  'modern-grid': [
    { id: 'laptop', name: 'Notebook', price: 2499.9, image_url: '', description: 'Notebook para trabalho', category: 'Tecnologia' },
    { id: 'monitor', name: 'Monitor', price: 899.9, image_url: '', description: 'Monitor 24 polegadas', category: 'Tecnologia' },
    { id: 'headphones', name: 'Fones de Ouvido', price: 299.9, image_url: '', description: 'Fones de ouvido premium', category: 'Tecnologia' }
  ],
  'story-driven': [
    { id: 'camera', name: 'Câmera Digital', price: 1899.9, image_url: '', description: 'Câmera para capturar momentos', category: 'Fotografia' },
    { id: 'photo-album', name: 'Álbum de Fotos', price: 89.9, image_url: '', description: 'Álbum para guardar memórias', category: 'Fotografia' }
  ],
  'minimal-elegant': [
    { id: 'vase', name: 'Vaso Decorativo', price: 149.9, image_url: '', description: 'Vaso minimalista', category: 'Decoração' },
    { id: 'candle', name: 'Vela Aromática', price: 39.9, image_url: '', description: 'Vela com aroma relaxante', category: 'Decoração' }
  ]
};

const EditSite = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [site, setSite] = useState<Site | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [siteProducts, setSiteProducts] = useState<SiteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [heroImageFit, setHeroImageFit] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [storyImageFit, setStoryImageFit] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<{
    id: string;
    name: string;
    price: number;
    description: string;
    image_url: string;
    category?: string;
  } | null>(null);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name-asc' | 'price-asc' | 'price-desc'>('name-asc');
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    description: '',
    image_url: '',
    category: 'Eletrodomésticos'
  });
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    story_text: "",
    color_scheme: "elegant-gold",
    font_family: "inter",
    font_color_menu: "default",
    font_color_hero: "white",
    title_color: "default",
    section_title_1: "O Início de Tudo",
    section_title_2: "Nossa Nova Casa",
    payment_method: "stripe",
    stripe_publishable_key: "",
    stripe_secret_key: "",
    hero_images: [] as string[],
    story_images: [] as string[],
    // hero_image_fit: 'cover' as 'cover' | 'contain' | 'fill',
    // story_image_fit: 'cover' as 'cover' | 'contain' | 'fill',
    event_date: "",
    event_time: "",
    event_location: "",
  });

  const handleFileUpload = async (files: File[], userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('site-images')
        .upload(fileName, file);
      
      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

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
    if (id && profile) {
      loadSiteData();
    }
  }, [id, profile]);

  const loadSiteData = async () => {
    try {
      // Carregar dados do site
      const { data: siteData, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('id', id)
        .eq('creator_id', profile?.id)
        .single();

      if (siteError) throw siteError;
      
      setSite(siteData);
      setFormData({
        title: siteData.title || "",
        description: siteData.description || "",
        story_text: siteData.story_text || "",
        color_scheme: (siteData as any).color_scheme || "elegant-gold",
        font_family: (siteData as any).font_family || "inter",
        font_color_menu: (siteData as any).font_color_menu || "default",
        font_color_hero: (siteData as any).font_color_hero || "white",
        title_color: (siteData as any).title_color || "default",
        section_title_1: (siteData as any).section_title_1 || "O Início de Tudo",
        section_title_2: (siteData as any).section_title_2 || "Nossa Nova Casa",
        payment_method: (siteData as any).payment_method || "stripe",
        stripe_publishable_key: (siteData as any).stripe_publishable_key || "",
        stripe_secret_key: (siteData as any).stripe_secret_key || "",
        hero_images: siteData.hero_images || [],
        story_images: siteData.story_images || [],
        // hero_image_fit: (siteData as any).hero_image_fit || 'cover',
        // story_image_fit: (siteData as any).story_image_fit || 'cover',
        event_date: (siteData as any).event_date || "",
        event_time: (siteData as any).event_time || "",
        event_location: (siteData as any).event_location || "",
      });

      // Sincronizar estados locais de enquadramento com formData
      // setHeroImageFit((siteData as any).hero_image_fit || 'cover');
      // setStoryImageFit((siteData as any).story_image_fit || 'cover');

      // Carregar produtos do site
      const { data: siteProductsData, error: siteProductsError } = await supabase
        .from('site_products')
        .select('*')
        .eq('site_id', id)
        .order('position', { ascending: true });

      if (siteProductsError) throw siteProductsError;

      // Carregar todos os produtos disponíveis
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active');

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Se não há produtos no site, adicionar produtos padrão do layout
      if ((!siteProductsData || siteProductsData.length === 0) && productsData && productsData.length > 0) {
        console.log('Adicionando produtos padrão do layout ao site...');
        
        // Pegar os primeiros 8 produtos como padrão para o layout
        const defaultProducts = productsData.slice(0, 8);
        const defaultSiteProducts = [];
        
        for (let i = 0; i < defaultProducts.length; i++) {
          const product = defaultProducts[i];
          try {
            const { data: newSiteProduct, error: insertError } = await supabase
              .from('site_products')
              .insert([{
                site_id: siteData.id,
                product_id: product.id,
                position: i + 1,
                is_available: true
              }])
              .select()
              .single();

            if (!insertError && newSiteProduct) {
              defaultSiteProducts.push(newSiteProduct);
            }
          } catch (err) {
            console.error('Erro ao adicionar produto padrão:', product.id, err);
          }
        }
        
        setSiteProducts(defaultSiteProducts);
        
        toast({
          title: "Lista de presentes criada!",
          description: "Produtos padrão foram adicionados à sua lista de presentes.",
        });
      } else {
        setSiteProducts(siteProductsData || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do site.",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !profile) return;

    setUploading(true);
    try {
      const uploadedUrls = await handleFileUpload(Array.from(files), profile.id);
      setFormData(prev => ({
        ...prev,
        hero_images: [...(prev.hero_images || []), ...uploadedUrls]
      }));
      toast({
        title: "Imagens enviadas!",
        description: `${uploadedUrls.length} imagem(ns) adicionada(s) ao hero.`,
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar as imagens. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !profile) return;

    setUploading(true);
    try {
      const uploadedUrls = await handleFileUpload(Array.from(files), profile.id);
      setFormData(prev => ({
        ...prev,
        story_images: [...(prev.story_images || []), ...uploadedUrls]
      }));
      toast({
        title: "Imagens enviadas!",
        description: `${uploadedUrls.length} imagem(ns) adicionada(s) à história.`,
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar as imagens. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !profile) return;

    setUploading(true);
    try {
      const uploadedUrls = await handleFileUpload(Array.from(files), profile.id);
      
      if (isEditing) {
        setEditing(prev => ({ ...prev, image_url: uploadedUrls[0] }));
      } else {
        setNewProduct(prev => ({ ...prev, image_url: uploadedUrls[0] }));
      }
      
      toast({
        title: "Imagem enviada!",
        description: "Imagem do produto foi enviada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleSave = async () => {
    if (!site) return;
    
    setSaving(true);
    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        story_text: formData.story_text || null,
        color_scheme: formData.color_scheme || 'elegant-gold',
        font_family: formData.font_family || 'playfair',
        font_color_menu: formData.font_color_menu || 'default',
        font_color_hero: formData.font_color_hero || 'white',
        title_color: formData.title_color || 'default',
        section_title_1: formData.section_title_1 || 'O Início de Tudo',
        section_title_2: formData.section_title_2 || 'Nossa Nova Casa',
        hero_images: formData.hero_images || [],
        story_images: formData.story_images || [],
        // hero_image_fit: formData.hero_image_fit || 'cover',
        // story_image_fit: formData.story_image_fit || 'cover',
        event_date: formData.event_date || null,
        event_time: formData.event_time || null,
        event_location: formData.event_location || null,
      };

      const { error } = await supabase
        .from('sites')
        .update(updateData)
        .eq('id', site.id);

      if (error) throw error;

      toast({
        title: "Alterações salvas!",
        description: "As informações do site foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addProductToSite = async (productId: string) => {
    if (!site) return;
    
    try {
      // Primeiro tenta buscar o produto da tabela products
      let product = products.find(p => p.id === productId);
      
      // Se não encontrar, usa o catálogo padrão
      if (!product) {
        const catalog = DEFAULT_CATALOG_BY_LAYOUT[site?.layout_id || 'cha-casa-nova'] || DEFAULT_CATALOG_BY_LAYOUT['cha-casa-nova'];
        const catalogProduct = catalog.find(p => p.id === productId);
        if (!catalogProduct) {
          toast({
            title: "Erro",
            description: "Produto não encontrado.",
            variant: "destructive",
          });
          return;
        }
        
        // Cria o produto na tabela products primeiro
        const imageUrl = catalogProduct.image_url.includes('/src/assets/') 
          ? catalogProduct.image_url 
          : catalogProduct.image_url || getProductImageFallback(catalogProduct.id, catalogProduct.name);
          
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert([{
            id: catalogProduct.id,
            name: catalogProduct.name,
            price: catalogProduct.price,
            image_url: imageUrl,
            description: catalogProduct.description,
            category: catalogProduct.category || 'Eletrodomésticos',
            status: 'active'
          }])
          .select()
          .single();
          
        if (productError) {
          console.error('Erro ao criar produto:', productError);
          toast({
            title: "Erro",
            description: "Não foi possível criar o produto.",
            variant: "destructive",
          });
          return;
        }
        
        product = newProduct;
        setProducts([...products, newProduct]);
      }
      
      const position = Math.max(...siteProducts.map(sp => sp.position), 0) + 1;
      
      const { data, error } = await supabase
        .from('site_products')
        .insert([{
          site_id: site.id,
          product_id: product.id,
          position,
          is_available: true
        }])
        .select()
        .single();

      if (error) throw error;

      setSiteProducts([...siteProducts, data]);
      toast({
        title: "Produto adicionado!",
        description: "O produto foi adicionado à lista de presentes.",
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto.",
        variant: "destructive",
      });
    }
  };

  const removeProductFromSite = async (siteProductId: string) => {
    try {
      const { error } = await supabase
        .from('site_products')
        .delete()
        .eq('id', siteProductId);

      if (error) throw error;

      setSiteProducts(siteProducts.filter(sp => sp.id !== siteProductId));
      toast({
        title: "Produto removido!",
        description: "O produto foi removido da lista de presentes.",
      });
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto.",
        variant: "destructive",
      });
    }
  };

  const updateSiteProduct = async () => {
    if (!editing || !site) return;
    
    try {
      // Primeiro, vamos atualizar o produto principal se a categoria mudou
      const currentProduct = products.find(p => p.id === editing.id);
      if (currentProduct && editing.category && editing.category !== currentProduct.category) {
        const { error: productError } = await supabase
          .from('products')
          .update({
            category: editing.category
          })
          .eq('id', editing.id);

        if (productError) {
          console.error('Erro ao atualizar categoria do produto:', productError);
          // Continua mesmo se houver erro na categoria, para não impedir outras atualizações
        } else {
          // Atualizar lista local de produtos
          setProducts(products.map(p => 
            p.id === editing.id 
              ? { ...p, category: editing.category }
              : p
          ));
        }
      }

      // Encontrar o site_product correspondente para atualizar campos customizados
      const siteProduct = siteProducts.find(sp => {
        const product = products.find(p => p.id === sp.product_id);
        return product?.id === editing.id;
      });

      if (siteProduct) {
        const { error } = await supabase
          .from('site_products')
          .update({
            custom_name: editing.name !== currentProduct?.name ? editing.name : null,
            custom_price: editing.price !== currentProduct?.price ? editing.price : null,
            custom_description: editing.description !== currentProduct?.description ? editing.description : null,
            custom_image_url: editing.image_url !== currentProduct?.image_url ? editing.image_url : null,
          })
          .eq('id', siteProduct.id);

        if (error) throw error;

        // Atualizar a lista local de site_products
        setSiteProducts(siteProducts.map(sp => 
          sp.id === siteProduct.id 
            ? {
                ...sp,
                custom_name: editing.name !== currentProduct?.name ? editing.name : null,
                custom_price: editing.price !== currentProduct?.price ? editing.price : null,
                custom_description: editing.description !== currentProduct?.description ? editing.description : null,
                custom_image_url: editing.image_url !== currentProduct?.image_url ? editing.image_url : null,
              }
            : sp
        ));
      }

      toast({
        title: "Produto atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      
      // Recarregar dados para garantir que as categorias apareçam corretamente
      await loadSiteData();
      
      setEditOpen(false);
      setEditing(null);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o produto.",
        variant: "destructive",
      });
    }
  };

  const createNewProduct = async () => {
    if (!newProduct.name || !newProduct.price || !site) return;
    
    try {
      const productId = `custom-${Date.now()}`;
      
      // Cria o produto na tabela products
      const { data: createdProduct, error: productError } = await supabase
        .from('products')
        .insert([{
          id: productId,
          name: newProduct.name,
          price: newProduct.price,
          image_url: newProduct.image_url || null,
          description: newProduct.description || null,
          category: newProduct.category || 'Eletrodomésticos',
          status: 'active'
        }])
        .select()
        .single();
        
      if (productError) {
        console.error('Erro ao criar produto:', productError);
        toast({
          title: "Erro",
          description: "Não foi possível criar o produto.",
          variant: "destructive",
        });
        return;
      }
      
      setProducts([...products, createdProduct]);
      
      // Adiciona automaticamente à lista do site
      const position = Math.max(...siteProducts.map(sp => sp.position), 0) + 1;
      
      const { data: siteProduct, error: siteError } = await supabase
        .from('site_products')
        .insert([{
          site_id: site.id,
          product_id: createdProduct.id,
          position,
          is_available: true
        }])
        .select()
        .single();

      if (siteError) {
        console.error('Erro ao adicionar produto ao site:', siteError);
        toast({
          title: "Erro",
          description: "Produto criado mas não foi possível adicioná-lo à lista.",
          variant: "destructive",
        });
        return;
      }

      setSiteProducts([...siteProducts, siteProduct]);
      toast({
        title: "Produto criado!",
        description: "O produto foi criado e adicionado à lista de presentes.",
      });
      
      setNewProductOpen(false);
      setNewProduct({ name: '', price: 0, description: '', image_url: '', category: 'Eletrodomésticos' });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o produto.",
        variant: "destructive",
      });
    }
  };

  const getSortedSiteProducts = () => {
    const sorted = [...siteProducts];
    
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => {
          const productA = products.find(p => p.id === a.product_id);
          const productB = products.find(p => p.id === b.product_id);
          const nameA = a.custom_name || productA?.name || '';
          const nameB = b.custom_name || productB?.name || '';
          return nameA.localeCompare(nameB, 'pt-BR');
        });
      case 'price-asc':
        return sorted.sort((a, b) => {
          const productA = products.find(p => p.id === a.product_id);
          const productB = products.find(p => p.id === b.product_id);
          const priceA = a.custom_price || productA?.price || 0;
          const priceB = b.custom_price || productB?.price || 0;
          return priceA - priceB;
        });
      case 'price-desc':
        return sorted.sort((a, b) => {
          const productA = products.find(p => p.id === a.product_id);
          const productB = products.find(p => p.id === b.product_id);
          const priceA = a.custom_price || productA?.price || 0;
          const priceB = b.custom_price || productB?.price || 0;
          return priceB - priceA;
        });
      default:
        return sorted;
    }
  };

  const exportSiteProductsToCSV = () => {
    if (siteProducts.length === 0) {
      toast({
        title: "Nenhum produto para exportar",
        description: "Adicione alguns produtos à sua lista de presentes antes de exportar.",
        variant: "destructive",
      });
      return;
    }

    // Preparar dados para CSV com produtos do site
    const csvData = siteProducts.map(siteProduct => {
      const product = products.find(p => p.id === siteProduct.product_id);
      if (!product) return null;
      
      const name = siteProduct.custom_name || product.name;
      const price = siteProduct.custom_price || product.price;
      const description = siteProduct.custom_description || product.description;
      const imageUrl = siteProduct.custom_image_url || product.image_url;
      
      return {
        'Nome': name,
        'Preço (R$)': price.toFixed(2).replace('.', ','),
        'Categoria': product.category || 'Sem categoria',
        'Descrição': description || '',
        'Disponível': siteProduct.is_available ? 'Sim' : 'Não',
        'URL da Imagem': imageUrl || '',
        'Posição na Lista': siteProduct.position || ''
      };
    }).filter(Boolean); // Remove valores null

    if (csvData.length === 0) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível processar os produtos para exportação.",
        variant: "destructive",
      });
      return;
    }

    // Converter para CSV
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(';'), // Cabeçalho
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escapar aspas duplas e envolver em aspas se contiver ponto e vírgula
          const escapedValue = String(value).replace(/"/g, '""');
          return escapedValue.includes(';') || escapedValue.includes('\n') 
            ? `"${escapedValue}"` 
            : escapedValue;
        }).join(';')
      )
    ].join('\n');

    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const siteName = site?.title?.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() || 'site';
    link.setAttribute('download', `lista-presentes-${siteName}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV exportado com sucesso!",
      description: `${csvData.length} produtos da lista de presentes foram exportados.`,
    });
  };

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !site) return;

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Espera colunas: nome, preco, descricao, imagem_url
      const products = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 2 && values[0] && values[1]) {
          products.push({
            id: `csv-${Date.now()}-${i}`,
            name: values[0],
            price: parseFloat(values[1]) || 0,
            description: values[2] || '',
            image_url: values[3] || null,
            category: values[4] || 'Eletrodomésticos',
            status: 'active'
          });
        }
      }

      if (products.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhum produto válido encontrado no arquivo CSV.",
          variant: "destructive",
        });
        return;
      }

      // Insere produtos no banco
      const { data: createdProducts, error: productError } = await supabase
        .from('products')
        .insert(products)
        .select();
        
      if (productError) {
        console.error('Erro ao importar produtos:', productError);
        toast({
          title: "Erro",
          description: "Não foi possível importar os produtos.",
          variant: "destructive",
        });
        return;
      }

      // Adiciona todos à lista do site
      const siteProductsToInsert = createdProducts.map((product, index) => ({
        site_id: site.id,
        product_id: product.id,
        position: Math.max(...siteProducts.map(sp => sp.position), 0) + index + 1,
        is_available: true
      }));

      const { data: newSiteProducts, error: siteError } = await supabase
        .from('site_products')
        .insert(siteProductsToInsert)
        .select();

      if (siteError) {
        console.error('Erro ao adicionar produtos importados ao site:', siteError);
        toast({
          title: "Parcialmente importado",
          description: "Produtos criados mas alguns não foram adicionados à lista.",
          variant: "destructive",
        });
      } else {
        setSiteProducts([...siteProducts, ...newSiteProducts]);
      }

      setProducts([...products, ...createdProducts]);
      toast({
        title: "Produtos importados!",
        description: `${createdProducts.length} produtos foram importados com sucesso.`,
      });
      
      setCsvImportOpen(false);
    } catch (error) {
      console.error('Erro ao processar CSV:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o arquivo CSV.",
        variant: "destructive",
      });
    }
    
    // Limpa o input
    event.target.value = '';
  };

  const deleteSite = async () => {
    if (!site) return;
    
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o site "${site.title}"? Esta ação não pode ser desfeita.`
    );
    
    if (!confirmDelete) return;
    
    try {
      // Deletar produtos do site primeiro (devido às foreign keys)
      await supabase
        .from('site_products')
        .delete()
        .eq('site_id', site.id);
      
      // Deletar RSVPs
      await supabase
        .from('rsvps')
        .delete()
        .eq('site_id', site.id);
      
      // Deletar o site
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', site.id);

      if (error) throw error;

      toast({
        title: "Site excluído!",
        description: "O site foi excluído permanentemente.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao excluir site:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o site.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle>Site não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Editando: {site.title}</h1>
                <p className="text-sm text-muted-foreground">Painel de Administração</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">URL do site:</div>
                <div className="text-xs font-mono text-primary">
                  {generateSiteUrl(site)}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(generateSiteUrl(site), '_blank')}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Visualizar Site
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={deleteSite}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir Site
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving || uploading}
                className="gap-2"
              >
                {(saving || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                {uploading ? "Enviando imagens..." : saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="design" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="design" className="gap-2">
              <Palette className="h-4 w-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <Type className="h-4 w-4" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Lista de Presentes
            </TabsTrigger>
            <TabsTrigger value="rsvps" className="gap-2">
              <Users className="h-4 w-4" />
              Confirmações de Presença
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paleta de Cores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {colorSchemes.map((scheme) => (
                    <div key={scheme.id} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={scheme.id}
                        name="colorScheme"
                        value={scheme.id}
                        checked={formData.color_scheme === scheme.id}
                        onChange={(e) => setFormData({ ...formData, color_scheme: e.target.value })}
                        className="w-4 h-4"
                      />
                      <label htmlFor={scheme.id} className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="flex gap-1">
                          {scheme.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{scheme.name}</span>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fonte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Família da Fonte</Label>
                    <Select 
                      value={formData.font_family} 
                      onValueChange={(value) => setFormData({ ...formData, font_family: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font.id} value={font.id}>
                            <span style={{ fontFamily: font.value }}>{font.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cor da Fonte do Menu</Label>
                    <Select 
                      value={formData.font_color_menu} 
                      onValueChange={(value) => setFormData({ ...formData, font_color_menu: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontColors.map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: color.value }}
                              />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cor da Fonte do Hero</Label>
                    <Select 
                      value={formData.font_color_hero} 
                      onValueChange={(value) => setFormData({ ...formData, font_color_hero: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {heroFontColors.map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: color.value }}
                              />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Site</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Título do seu site"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição ou mensagem especial"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="story_text">Texto da Nossa História</Label>
                    <Textarea
                      id="story_text"
                      value={formData.story_text}
                      onChange={(e) => setFormData({ ...formData, story_text: e.target.value })}
                      placeholder="Conte sua história..."
                      rows={4}
                    />
                  </div>
                  
                  {/* Títulos das Seções */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="section_title_1">Título da Primeira Seção</Label>
                      <Input
                        id="section_title_1"
                        value={formData.section_title_1}
                        onChange={(e) => setFormData({ ...formData, section_title_1: e.target.value })}
                        placeholder="Ex: O Início de Tudo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="section_title_2">Título da Segunda Seção</Label>
                      <Input
                        id="section_title_2"
                        value={formData.section_title_2}
                        onChange={(e) => setFormData({ ...formData, section_title_2: e.target.value })}
                        placeholder="Ex: Nossa Nova Casa"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cor dos Títulos das Seções</Label>
                    <Select 
                      value={formData.title_color} 
                      onValueChange={(value) => setFormData({ ...formData, title_color: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontColors.map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: color.value }}
                              />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Campos do evento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event_date">Data do Evento</Label>
                      <Input
                        id="event_date"
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event_time">Horário do Evento</Label>
                      <Input
                        id="event_time"
                        type="time"
                        value={formData.event_time}
                        onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event_location">Local do Evento</Label>
                    <Input
                      id="event_location"
                      value={formData.event_location}
                      onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                      placeholder="Ex: Rua das Flores, 123 - Centro"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Imagens do Hero
                    <div className="flex items-center gap-2">
                      <Label htmlFor="hero-fit" className="text-sm font-normal">Enquadramento:</Label>
                      <Select value={heroImageFit} onValueChange={(value: 'cover' | 'contain' | 'fill') => {
                        setHeroImageFit(value);
                        // setFormData(prev => ({ ...prev, hero_image_fit: value }));
                      }}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cover">Cobrir</SelectItem>
                          <SelectItem value="contain">Caber</SelectItem>
                          <SelectItem value="fill">Preencher</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.hero_images?.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`Hero ${index + 1}`}
                          className={`w-full h-32 rounded-lg transition-all ${
                            heroImageFit === 'cover' ? 'object-cover' :
                            heroImageFit === 'contain' ? 'object-contain bg-muted' : 
                            'object-fill'
                          }`}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const newImages = formData.hero_images?.filter((_, i) => i !== index) || [];
                            setFormData({ ...formData, hero_images: newImages });
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <div className="h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleHeroImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploading}
                        />
                        <Button variant="outline" size="sm" disabled={uploading}>
                          {uploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Enviando...
                            </>
                          ) : (
                            "+ Adicionar Imagem"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <strong>Cobrir:</strong> Imagem cobre toda a área (pode cortar). <strong>Caber:</strong> Imagem inteira visível (pode ter bordas). <strong>Preencher:</strong> Imagem estica para preencher.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Imagens da História
                    <div className="flex items-center gap-2">
                      <Label htmlFor="story-fit" className="text-sm font-normal">Enquadramento:</Label>
                      <Select value={storyImageFit} onValueChange={(value: 'cover' | 'contain' | 'fill') => {
                        setStoryImageFit(value);
                        // setFormData(prev => ({ ...prev, story_image_fit: value }));
                      }}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cover">Cobrir</SelectItem>
                          <SelectItem value="contain">Caber</SelectItem>
                          <SelectItem value="fill">Preencher</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.story_images?.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`História ${index + 1}`}
                          className={`w-full h-24 rounded-lg transition-all ${
                            storyImageFit === 'cover' ? 'object-cover' :
                            storyImageFit === 'contain' ? 'object-contain bg-muted' : 
                            'object-fill'
                          }`}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                          onClick={() => {
                            const newImages = formData.story_images?.filter((_, i) => i !== index) || [];
                            setFormData({ ...formData, story_images: newImages });
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <div className="h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleStoryImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploading}
                        />
                        <Button variant="outline" size="sm" disabled={uploading}>
                          {uploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Enviando...
                            </>
                          ) : (
                            "+ Adicionar"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <strong>Cobrir:</strong> Imagem cobre toda a área (pode cortar). <strong>Caber:</strong> Imagem inteira visível (pode ter bordas). <strong>Preencher:</strong> Imagem estica para preencher.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Produtos na Lista ({siteProducts.length})</CardTitle>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={(value: 'name-asc' | 'price-asc' | 'price-desc') => setSortBy(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name-asc">A-Z</SelectItem>
                        <SelectItem value="price-asc">Menor preço</SelectItem>
                        <SelectItem value="price-desc">Maior preço</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportSiteProductsToCSV}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Exportar CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewProductOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Novo Produto
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCsvImportOpen(true)}
                    >
                      📄 Importar CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getSortedSiteProducts().map((siteProduct) => {
                      const product = products.find(p => p.id === siteProduct.product_id);
                      if (!product) return null;
                      
                      const name = siteProduct.custom_name || product.name;
                      const price = siteProduct.custom_price || product.price;
                      const description = siteProduct.custom_description || product.description;
                      const imageUrl = siteProduct.custom_image_url || product.image_url;
                      
                      return (
                        <div key={siteProduct.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              {imageUrl ? (
                                <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{name}</p>
                              <p className="text-sm text-muted-foreground">R$ {price.toFixed(2)}</p>
                              {description && (
                                <p className="text-xs text-muted-foreground">{description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const product = products.find(p => p.id === siteProduct.product_id);
                                if (product) {
                                  setEditing({
                                    id: product.id, // Usar o ID do produto, não do site_product
                                    name: siteProduct.custom_name || product.name,
                                    price: siteProduct.custom_price || product.price,
                                    description: siteProduct.custom_description || product.description || '',
                                    image_url: siteProduct.custom_image_url || product.image_url || '',
                                    category: product.category || 'Eletrodomésticos'
                                  });
                                  setEditOpen(true);
                                }
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeProductFromSite(siteProduct.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {siteProducts.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum produto adicionado ainda
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sugestões de Produtos</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Produtos disponíveis para adicionar à sua lista
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {/* Produtos existentes do banco que não estão na lista */}
                    {products
                      .filter(product => !siteProducts.some(sp => sp.product_id === product.id))
                      .map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">R$ {product.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addProductToSite(product.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    
                    {/* Produtos do catálogo padrão do layout */}
                    {(DEFAULT_CATALOG_BY_LAYOUT[site?.layout_id || 'cha-casa-nova'] || [])
                      .filter(catalogProduct => 
                        !products.some(p => p.id === catalogProduct.id) &&
                        !siteProducts.some(sp => sp.product_id === catalogProduct.id)
                      )
                      .map((catalogProduct) => (
                        <div key={catalogProduct.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <img src={catalogProduct.image_url} alt={catalogProduct.name} className="w-full h-full object-cover rounded-lg" />
                            </div>
                            <div>
                              <p className="font-medium">{catalogProduct.name}</p>
                              <p className="text-sm text-muted-foreground">R$ {catalogProduct.price.toFixed(2)}</p>
                              <Badge variant="secondary" className="text-xs mt-1">Catálogo</Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addProductToSite(catalogProduct.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                    {products.filter(product => !siteProducts.some(sp => sp.product_id === product.id)).length === 0 && 
                     (DEFAULT_CATALOG_BY_LAYOUT[site?.layout_id || 'cha-casa-nova'] || []).filter(catalogProduct => 
                       !products.some(p => p.id === catalogProduct.id) &&
                       !siteProducts.some(sp => sp.product_id === catalogProduct.id)
                     ).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Todos os produtos disponíveis já foram adicionados
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rsvps" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* RSVPs List */}
              <RSVPList siteId={site.id} />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status do Site</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Site {site.is_active ? 'Ativo' : 'Inativo'}</p>
                      <p className="text-sm text-muted-foreground">
                        {site.is_active ? 'Seu site está público e recebendo visitantes' : 'Seu site está offline'}
                      </p>
                    </div>
                    <Badge variant={site.is_active ? "default" : "secondary"}>
                      {site.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Meio de Pagamento</Label>
                    <Select 
                      value={formData.payment_method} 
                      onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="paypal" disabled>PayPal (Em breve)</SelectItem>
                        <SelectItem value="mercadopago" disabled>Mercado Pago (Em breve)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.payment_method === 'stripe' && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-medium">Configurações do Stripe</h4>
                      <div className="space-y-2">
                        <Label htmlFor="stripe_publishable_key">Chave Pública do Stripe</Label>
                        <Input
                          id="stripe_publishable_key"
                          type="text"
                          placeholder="pk_test_..."
                          value={formData.stripe_publishable_key}
                          onChange={(e) => setFormData({ ...formData, stripe_publishable_key: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stripe_secret_key">Chave Secreta do Stripe</Label>
                        <Input
                          id="stripe_secret_key"
                          type="password"
                          placeholder="sk_test_..."
                          value={formData.stripe_secret_key}
                          onChange={(e) => setFormData({ ...formData, stripe_secret_key: e.target.value })}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Suas chaves serão armazenadas de forma segura e usadas para processar pagamentos.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Edição de Produto */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Produto</Label>
                <Input
                  id="edit-name"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Nome do produto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Preço (R$)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Descrição do produto"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoria</Label>
                <div className="flex gap-2">
                  <Select 
                    value={editing.category || 'Eletrodomésticos'} 
                    onValueChange={(value) => setEditing({ ...editing, category: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newCategory = prompt("Nome da nova categoria:");
                      if (newCategory && newCategory.trim() && editing) {
                        setEditing({ ...editing, category: newCategory.trim() });
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image">Imagem do Produto</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="edit-image"
                      value={editing.image_url}
                      onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg ou faça upload"
                      className="flex-1"
                    />
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleProductImageUpload(e, true)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <Button type="button" variant="outline" disabled={uploading}>
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Upload"
                        )}
                      </Button>
                    </div>
                  </div>
                  {editing.image_url && (
                    <div className="mt-2">
                      <img 
                        src={editing.image_url} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={updateSiteProduct}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Criar Novo Produto */}
      <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nome do Produto *</Label>
              <Input
                id="new-name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Ex: Panela de Pressão"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-price">Preço (R$) *</Label>
              <Input
                id="new-price"
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-description">Descrição</Label>
              <Textarea
                id="new-description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Descrição opcional do produto"
                rows={3}
              />
            </div>
              <div className="space-y-2">
                <Label htmlFor="new-category">Categoria</Label>
                <div className="flex gap-2">
                  <Select 
                    value={newProduct.category} 
                    onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newCategory = prompt("Nome da nova categoria:");
                      if (newCategory && newCategory.trim()) {
                        const updatedCategories = [...categories, newCategory.trim()];
                        // Não há setCategories aqui, então vamos apenas atualizar o produto
                        setNewProduct({ ...newProduct, category: newCategory.trim() });
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            <div className="space-y-2">
              <Label htmlFor="new-image">Imagem do Produto</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="new-image"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg ou faça upload"
                    className="flex-1"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProductImageUpload(e, false)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <Button type="button" variant="outline" disabled={uploading}>
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Upload"
                      )}
                    </Button>
                  </div>
                </div>
                {newProduct.image_url && (
                  <div className="mt-2">
                    <img 
                      src={newProduct.image_url} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewProductOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={createNewProduct}
              disabled={!newProduct.name || !newProduct.price}
            >
              Criar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Importar CSV */}
      <Dialog open={csvImportOpen} onOpenChange={setCsvImportOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importar Produtos via CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Formato do arquivo CSV:</h4>
              <code className="text-sm text-muted-foreground">
                nome,preco,descricao,imagem_url,categoria<br/>
                Panela de Pressão,89.90,Panela 5L,https://...,Cozinha<br/>
                Liquidificador,149.90,600W,https://...,Eletrodomésticos
              </code>
            </div>
            <div className="space-y-2">
              <Label htmlFor="csv-file">Selecionar arquivo CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleCsvImport}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Os produtos serão automaticamente adicionados à sua lista de presentes.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCsvImportOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditSite;