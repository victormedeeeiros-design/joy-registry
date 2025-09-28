import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, Package, Image, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: string;
  status: string;
  created_at: string;
}

const ManageProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: 0,
    description: "",
    category: "",
    image_url: ""
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;
      
      const uniqueCategories = [...new Set(data?.map(p => p.category).filter(Boolean))] as string[];
      
      // Adicionar categorias padrão se não existirem
      const defaultCategories = ['Eletrodomésticos', 'Brincadeiras', 'Casa e Jardim', 'Cozinha'];
      const allCategories = [...new Set([...defaultCategories, ...uniqueCategories])];
      
      setCategories(allCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description || "",
        category: product.category || "",
        image_url: product.image_url || ""
      });
    } else {
      setEditingProduct(null);
      setFormData({
        id: "",
        name: "",
        price: 0,
        description: "",
        category: "",
        image_url: ""
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingProduct(null);
    setShowNewCategory(false);
    setNewCategoryName("");
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      const newCategories = [...categories, newCategoryName.trim()];
      setCategories([...new Set(newCategories)]);
      setFormData({ ...formData, category: newCategoryName.trim() });
      setNewCategoryName("");
      setShowNewCategory(false);
      
      toast({
        title: "Categoria adicionada!",
        description: `A categoria "${newCategoryName.trim()}" foi criada com sucesso.`,
      });
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    // Não permitir deletar categorias padrão
    const defaultCategories = ['Eletrodomésticos', 'Brincadeiras', 'Casa e Jardim', 'Cozinha'];
    if (defaultCategories.includes(categoryToDelete)) {
      toast({
        title: "Erro",
        description: "Não é possível deletar categorias padrão.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoryToDelete}"?`)) {
      return;
    }

    const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
    setCategories(updatedCategories);
    
    toast({
      title: "Categoria removida!",
      description: `A categoria "${categoryToDelete}" foi removida.`,
    });
  };

  const handleSaveProduct = async () => {
    if (!formData.name.trim() || formData.price <= 0) {
      toast({
        title: "Erro",
        description: "Nome e preço são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingProduct) {
        // Atualizar produto existente
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name.trim(),
            price: formData.price,
            description: formData.description.trim() || null,
            category: formData.category.trim() || null,
            image_url: formData.image_url.trim() || null,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: "Produto atualizado!",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        // Criar novo produto
        const productId = formData.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');

        const { error } = await supabase
          .from('products')
          .insert([{
            id: productId,
            name: formData.name.trim(),
            price: formData.price,
            description: formData.description.trim() || null,
            category: formData.category.trim() || null,
            image_url: formData.image_url.trim() || null,
            status: 'active'
          }]);

        if (error) throw error;

        toast({
          title: "Produto criado!",
          description: "O novo produto foi adicionado com sucesso.",
        });
      }

      handleCloseDialog();
      loadProducts();
      loadCategories();
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o produto.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Produto excluído!",
        description: "O produto foi removido com sucesso.",
      });

      loadProducts();
    } catch (error: any) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      });
    }
  };

  const getProductImage = (product: Product) => {
    if (product.image_url) {
      return product.image_url;
    }
    
    // Fallback para imagens locais baseado no ID do produto
    const imageMap: { [key: string]: string } = {
      'microwave': '/src/assets/products/microwave.jpg',
      'range-hood': '/src/assets/products/range-hood.jpg',
      'grill': '/src/assets/products/grill.jpg',
      'blender': '/src/assets/products/blender.jpg',
      'mixer': '/src/assets/products/mixer.jpg',
      'electric-oven': '/src/assets/products/electric-oven.jpg',
      'air-fryer': '/src/assets/products/air-fryer.jpg',
      'stove': '/src/assets/products/stove.jpg'
    };
    
    return imageMap[product.id] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
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
                onClick={() => navigate('/admin')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard Admin
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Gerenciar Produtos</h1>
                <p className="text-sm text-muted-foreground">Administrar lista de produtos disponíveis</p>
              </div>
            </div>
            
            <Button 
              onClick={() => handleOpenDialog()}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowCategoryManager(true)}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              Gerenciar Categorias
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const imageUrl = getProductImage(product);
            
            return (
              <Card key={product.id} className="hover:shadow-elegant transition-all duration-300">
                <CardHeader className="p-4">
                  <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-muted">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                      <Package className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  {product.description && (
                    <CardDescription className="text-sm">
                      {product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-lg font-semibold text-primary">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </div>
                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                      {product.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  {product.category && (
                    <div className="mb-4">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(product)}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {products.length === 0 && (
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Comece adicionando alguns produtos à plataforma.
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Produto
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog para criar/editar produto */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? 'Altere as informações do produto abaixo.'
                : 'Preencha as informações do novo produto.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Micro-ondas Panasonic"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Preço *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do produto..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              {!showNewCategory ? (
                <div className="flex gap-2">
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione uma categoria" />
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
                    onClick={() => setShowNewCategory(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da nova categoria"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNewCategory()}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewCategory}
                  >
                    Adicionar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewCategory(false);
                      setNewCategoryName("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image_url" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                URL da Imagem
              </Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct}>
              {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Gerenciar Categorias */}
      <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gerenciar Categorias
            </DialogTitle>
            <DialogDescription>
              Adicione ou remova categorias para organizar seus produtos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Lista de Categorias */}
            <div className="space-y-2">
              <Label>Categorias Existentes</Label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {categories.map((category) => {
                  const isDefault = ['Eletrodomésticos', 'Brincadeiras', 'Casa e Jardim', 'Cozinha'].includes(category);
                  return (
                    <div key={category} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-sm">{category}</span>
                      {!isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Adicionar Nova Categoria */}
            <div className="space-y-2">
              <Label>Adicionar Nova Categoria</Label>
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nome da nova categoria"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewCategory()}
                />
                <Button
                  onClick={handleAddNewCategory}
                  disabled={!newCategoryName.trim()}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryManager(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageProducts;