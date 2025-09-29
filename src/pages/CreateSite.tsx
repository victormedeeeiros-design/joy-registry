import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Home, Palette, Type } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CreateSite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const layoutId = searchParams.get("layout") || "modern-grid";
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    story_text: "",
    eventType: "", 
    eventDate: "", 
    eventTime: "",
    eventLocation: "",
    hostNames: "", 
    heroImages: [] as File[], // Imagens do hero
    galleryImages: [] as File[], // Imagens da galeria/nossa história
    colorScheme: "elegant-gold",
    fontFamily: "inter",
    font_color_menu: "default",
    font_color_hero: "white",
    title_color: "default",
    section_title_1: "O Início de Tudo",
    section_title_2: "Nossa Nova Casa"
  });

  const layoutNames = {
    "cha-casa-nova": "Chá de Casa Nova"
  };

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
    { id: 'sloop', name: 'Sloop Script Pro (Premium)', value: 'Sloop Script Pro, cursive' },
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

  const handleInputChange = (field: string, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim() || !formData.eventType || !formData.hostNames.trim()) {
      toast({
        title: "Erro",
        description: "Título, tipo de evento e nomes dos anfitriões são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      console.log('Iniciando criação de site...', { formData, profile });
      
      // Upload das imagens primeiro
      let heroImageUrls: string[] = [];
      let galleryImageUrls: string[] = [];
      
      if (formData.heroImages.length > 0) {
        console.log('Fazendo upload das hero images...');
        heroImageUrls = await handleFileUpload(formData.heroImages, profile.id);
        console.log('Hero images uploaded:', heroImageUrls);
      }
      
      if (formData.galleryImages.length > 0) {
        console.log('Fazendo upload das gallery images...');
        galleryImageUrls = await handleFileUpload(formData.galleryImages, profile.id);
        console.log('Gallery images uploaded:', galleryImageUrls);
      }

      console.log('Inserindo site no banco de dados...');
      const siteData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        story_text: formData.story_text.trim() || null,
        layout_id: layoutId,
        creator_id: profile.id,
        is_active: true,
        hero_images: heroImageUrls,
        story_images: galleryImageUrls,
        event_date: formData.eventDate || null,
        event_time: formData.eventTime || null,
        event_location: formData.eventLocation || null,
        color_scheme: formData.colorScheme,
        font_family: formData.fontFamily,
        font_color_menu: formData.font_color_menu,
        font_color_hero: formData.font_color_hero,
        title_color: formData.title_color,
        section_title_1: formData.section_title_1,
        section_title_2: formData.section_title_2,
      };
      
      console.log('Site data to insert:', siteData);
      
      const { data, error } = await supabase
        .from('sites')
        .insert([siteData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir site:', error);
        throw error;
      }
      
      console.log('Site criado com sucesso:', data);

      toast({
        title: "Site criado com sucesso!",
        description: "Seu site de presentes foi criado e já está ativo.",
      });

      // Redirecionar para a página de edição do site - o slug será gerado automaticamente
      navigate(`/edit-site/${data.id}?success=created`);
      
    } catch (error) {
      console.error('Erro ao criar site:', error);
      toast({
        title: "Erro ao criar site",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/layouts")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Criar Novo Site</h1>
              <p className="text-muted-foreground">
                Layout selecionado: {layoutNames[layoutId as keyof typeof layoutNames]}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Site</CardTitle>
              <CardDescription>
                Preencha as informações básicas do seu site de presentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSite} className="space-y-6">
                {/* Tipo de Evento */}
                <div className="space-y-2">
                  <Label htmlFor="eventType">
                    Tipo de Evento <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.eventType} onValueChange={(value) => handleInputChange("eventType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de evento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cha-casa-nova">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Chá de Casa Nova
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selecione o tipo de celebração para personalizar seu site
                  </p>
                </div>

                {/* Nomes dos Anfitriões */}
                <div className="space-y-2">
                  <Label htmlFor="hostNames">
                    Nomes dos Anfitriões <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="hostNames"
                    placeholder="Ex: Maria e João, Família Silva"
                    value={formData.hostNames}
                    onChange={(e) => handleInputChange("hostNames", e.target.value)}
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    Quem está organizando este evento?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Título do Site <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Chá de Casa Nova da Maria e João"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este será o título principal do seu site de presentes
                  </p>
                </div>

                {/* Informações do Evento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Data do Evento (opcional)</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => handleInputChange("eventDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventTime">Horário (opcional)</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => handleInputChange("eventTime", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eventLocation">Local do Evento (opcional)</Label>
                  <Input
                    id="eventLocation"
                    value={formData.eventLocation}
                    onChange={(e) => handleInputChange("eventLocation", e.target.value)}
                    placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo"
                  />
                  <p className="text-xs text-muted-foreground">
                    Onde será a celebração?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mensagem Especial (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Ex: Estamos muito felizes por iniciar essa nova etapa em nossa casa nova! Venham celebrar conosco e nos ajudar a tornar nossa casa ainda mais especial."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    Uma mensagem carinhosa para seus convidados
                  </p>
                </div>

                {/* Upload de Imagens do Hero */}
                <div className="space-y-2">
                  <Label htmlFor="heroImages">Imagens do Hero (Fundo Principal)</Label>
                  <Input
                    id="heroImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleInputChange("heroImages", Array.from(e.target.files || []))}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  />
                  <p className="text-xs text-muted-foreground">
                    Escolha de 1 a 5 imagens que vão aparecer no fundo da página principal (recomendado: 1920x1080px)
                  </p>
                  {formData.heroImages.length > 0 && (
                    <p className="text-sm text-green-600">
                      {formData.heroImages.length} imagen{formData.heroImages.length > 1 ? 's' : ''} selecionada{formData.heroImages.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Upload de Imagens da Galeria */}
                <div className="space-y-2">
                  <Label htmlFor="galleryImages">Fotos da Nossa História (opcional)</Label>
                  <Input
                    id="galleryImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleInputChange("galleryImages", Array.from(e.target.files || []))}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                  />
                  <p className="text-xs text-muted-foreground">
                    Fotos do casal, da casa, momentos especiais para contar sua história
                  </p>
                  {formData.galleryImages.length > 0 && (
                    <p className="text-sm text-green-600">
                      {formData.galleryImages.length} imagen{formData.galleryImages.length > 1 ? 's' : ''} selecionada{formData.galleryImages.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Texto da Nossa História */}
                <div className="space-y-2">
                  <Label htmlFor="story_text">Texto da Nossa História (opcional)</Label>
                  <Textarea
                    id="story_text"
                    placeholder="Conte sua história... Ex: Há alguns anos, duas vidas se encontraram e descobriram que juntas formavam algo muito especial."
                    value={formData.story_text}
                    onChange={(e) => handleInputChange("story_text", e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este texto aparecerá na seção "Nossa História" do seu site
                  </p>
                </div>

                {/* Títulos das Seções */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="section_title_1">Título da Primeira Seção</Label>
                    <Input
                      id="section_title_1"
                      value={formData.section_title_1}
                      onChange={(e) => handleInputChange("section_title_1", e.target.value)}
                      placeholder="Ex: O Início de Tudo"
                    />
                    <p className="text-xs text-muted-foreground">
                      Título da primeira parte da história
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section_title_2">Título da Segunda Seção</Label>
                    <Input
                      id="section_title_2"
                      value={formData.section_title_2}
                      onChange={(e) => handleInputChange("section_title_2", e.target.value)}
                      placeholder="Ex: Nossa Nova Casa"
                    />
                    <p className="text-xs text-muted-foreground">
                      Título da segunda parte da história
                    </p>
                  </div>
                </div>

                {/* Paleta de Cores */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Paleta de Cores
                  </Label>
                  <div className="grid gap-3">
                    {colorSchemes.map((scheme) => (
                      <div key={scheme.id} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id={scheme.id}
                          name="colorScheme"
                          value={scheme.id}
                          checked={formData.colorScheme === scheme.id}
                          onChange={(e) => handleInputChange("colorScheme", e.target.value)}
                          className="w-4 h-4"
                        />
                        <label htmlFor={scheme.id} className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="flex gap-1">
                            {scheme.colors.map((color, index) => (
                              <div
                                key={index}
                                className="w-5 h-5 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{scheme.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Configurações de Fonte */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Configurações de Fonte
                  </Label>
                  
                  {/* Família da Fonte */}
                  <div className="space-y-2">
                    <Label>Família da Fonte</Label>
                    <Select value={formData.fontFamily} onValueChange={(value) => handleInputChange("fontFamily", value)}>
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

                  {/* Cor da Fonte do Menu */}
                  <div className="space-y-2">
                    <Label>Cor da Fonte do Menu</Label>
                    <Select 
                      value={formData.font_color_menu} 
                      onValueChange={(value) => handleInputChange("font_color_menu", value)}
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

                  {/* Cor da Fonte do Hero */}
                  <div className="space-y-2">
                    <Label>Cor da Fonte do Hero (Fundo Principal)</Label>
                    <Select 
                      value={formData.font_color_hero} 
                      onValueChange={(value) => handleInputChange("font_color_hero", value)}
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

                  {/* Cor dos Títulos das Seções */}
                  <div className="space-y-2">
                    <Label>Cor dos Títulos das Seções</Label>
                    <Select 
                      value={formData.title_color} 
                      onValueChange={(value) => handleInputChange("title_color", value)}
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
                </div>

                {/* Layout Preview */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Layout Selecionado</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{layoutNames[layoutId as keyof typeof layoutNames]}</p>
                      <p className="text-sm text-muted-foreground">
                        {layoutId === "modern-grid" && "Layout em grade limpo e moderno"}
                        {layoutId === "story-driven" && "Layout que conta uma história"}
                        {layoutId === "minimal-elegant" && "Design clean e sofisticado"}
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate("/layouts")}
                    >
                      Alterar
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/layouts")}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || uploading || !formData.title.trim() || !formData.eventType || !formData.hostNames.trim()}
                    className="flex-1 gap-2"
                  >
                    {(loading || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
                    {uploading ? "Enviando imagens..." : loading ? "Criando..." : "Criar Site"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateSite;