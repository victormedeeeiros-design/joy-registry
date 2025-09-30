import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

export const CartSidebar = ({ siteId }: { siteId?: string }) => {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  const handleCheckout = async () => {
    if (!siteId || items.length === 0) return;
    
    console.log('Checkout Debug - Items:', items);
    console.log('Checkout Debug - Site ID:', siteId);
    
    try {
      const payloadItems = items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        name: i.name,
        price: i.price,
        image_url: i.image,
      }));
      
      console.log('Checkout Debug - Payload Items:', payloadItems);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { items: payloadItems, siteId },
      });
      
      console.log('Checkout Debug - Response:', { data, error });
      
      if (error) throw error;
      if (data?.url) {
        // Detectar se é mobile para evitar popup blockers
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // No mobile, usar location.href para evitar popup blockers
          window.location.href = data.url;
        } else {
          // No desktop, manter o comportamento de nova aba
          window.open(data.url, '_blank');
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Erro ao processar pagamento. Tente novamente.');
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Meus Presentes</span>
          {itemCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Meus Presentes ({itemCount})
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Seu carrinho está vazio</p>
              <p className="text-sm text-muted-foreground mt-2">
                Adicione presentes para começar
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-primary font-semibold">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                <Button className="w-full" size="lg" onClick={handleCheckout} disabled={!siteId || items.length === 0}>
                  Finalizar Compra
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};