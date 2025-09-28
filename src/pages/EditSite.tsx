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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye, Palette, Type, Package, Settings, Trash2, Plus, Edit } from "lucide-react";

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
  color_scheme?: string;
  font_family?: string;
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
  { id: 'classic-navy', name: 'Azul Marinho Clássico', colors: ['#000080', '#F0F8FF', '#483D8B'] }
];

const fontFamilies = [
  { id: 'inter', name: 'Inter (Moderna)', value: 'Inter, sans-serif' },
  { id: 'playfair', name: 'Playfair Display (Elegante)', value: 'Playfair Display, serif' },
  { id: 'dancing', name: 'Dancing Script (Manuscrita)', value: 'Dancing Script, cursive' },
  { id: 'sloop', name: 'Sloop Script Pro (Premium)', value: 'Sloop Script Pro, cursive' },
  { id: 'montserrat', name: 'Montserrat (Clean)', value: 'Montserrat, sans-serif' }
];

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
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    story_text: "",
    color_scheme: "elegant-gold",
    font_family: "inter",
    payment_method: "stripe",
    stripe_publishable_key: "",
    stripe_secret_key: "",
    hero_images: [] as string[],
    story_images: [] as string[],
    event_date: "",
    event_time: "",
    event_location: "",
    custom_name: "",
    custom_price: 0,
    custom_description: "",
    custom_image_url: ""
  });

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
        payment_method: (siteData as any).payment_method || "stripe",
        stripe_publishable_key: (siteData as any).stripe_publishable_key || "",
        stripe_secret_key: (siteData as any).stripe_secret_key || "",
        hero_images: siteData.hero_images || [],
        story_images: siteData.story_images || [],
        event_date: (siteData as any).event_date || "",
        event_time: (siteData as any).event_time || "",
        event_location: (siteData as any).event_location || "",
        custom_name: "",
        custom_price: 0,
        custom_description: "",
        custom_image_url: ""
      });

      // Carregar produtos do site
      const { data: siteProductsData, error: siteProductsError } = await supabase
        .from('site_products')
        .select('*')
        .eq('site_id', id)
        .order('position', { ascending: true });

      if (siteProductsError) throw siteProductsError;
      setSiteProducts(siteProductsData || []);

      // Carregar todos os produtos disponíveis
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active');

      if (productsError) throw productsError;
      setProducts(productsData || []);

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

  const handleSave = async () => {
    if (!site) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sites')
        .update({
          title: formData.title,
          description: formData.description,
        story_text: formData.story_text || null,
        color_scheme: formData.color_scheme || 'elegant-gold',
        font_family: formData.font_family || 'inter',
        payment_method: formData.payment_method || 'stripe',
        stripe_publishable_key: formData.stripe_publishable_key || null,
        stripe_secret_key: formData.stripe_secret_key || null,
        event_date: formData.event_date || null,
        event_time: formData.event_time || null,
        event_location: formData.event_location || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', site.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Site atualizado com sucesso.",
      });
      
      setSite({ ...site, ...formData });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
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
      const position = Math.max(...siteProducts.map(sp => sp.position), 0) + 1;
      
      const { data, error } = await supabase
        .from('site_products')
        .insert([{
          site_id: site.id,
          product_id: productId,
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`/site/${site.id}`, '_blank')}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Visualizar Site
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="design" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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
                <CardContent>
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
                  <CardTitle>Imagens do Hero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.hero_images?.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`Hero ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
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
                      <Button variant="outline" size="sm">
                        + Adicionar Imagem
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Imagens da História</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.story_images?.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`História ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
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
                      <Button variant="outline" size="sm">
                        + Adicionar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos na Lista ({siteProducts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {siteProducts.map((siteProduct) => {
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
                                setFormData({
                                  ...formData,
                                  custom_name: name,
                                  custom_price: price,
                                  custom_description: description || '',
                                  custom_image_url: imageUrl || ''
                                });
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
                  <CardTitle>Adicionar Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
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
                    {products.filter(product => !siteProducts.some(sp => sp.product_id === product.id)).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Todos os produtos disponíveis já foram adicionados
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
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

              {/* RSVPs List */}
              <Card>
                <CardHeader>
                  <CardTitle>Confirmações de Presença</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {/* TODO: Implementar lista de RSVPs */}
                    <p className="text-center text-muted-foreground py-8">
                      As confirmações aparecerão aqui conforme os convidados responderem
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditSite;