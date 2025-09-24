import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign, 
  Package, 
  AlertTriangle 
} from "lucide-react";
import { 
  getProducts, 
  addSale, 
  type Product, 
  type SaleItem 
} from "@/utils/localStorage";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

    const addToCart = (product: Product) => {
    if (product.category === 'games' || product.stock <= 0) {
      if (product.category === 'games') {
        // Games are services, allow unlimited quantity
        const existingItem = cart.find(item => item.productId === product.id);
        
        if (existingItem) {
          setCart(cart.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ));
        } else {
          const newItem: SaleItem = {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            price: product.price,
          };
          setCart([...cart, newItem]);
        }
        return;
      }
      
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock`,
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} ${product.name}(s) available`,
          variant: "destructive",
        });
        return;
      }
      
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && product.category !== 'games' && newQuantity > product.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} ${product.name}(s) available`,
        variant: "destructive",
      });
      return;
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before checkout",
        variant: "destructive",
      });
      return;
    }

    const total = calculateTotal();
    
    addSale({
      items: cart,
      total,
    });

    setCart([]);
    setProducts(getProducts()); // Refresh products to show updated stock
    
    toast({
      title: "Sale Complete!",
      description: `Transaction completed successfully. Total: ${formatPrice(total)}`,
    });

    // Check for low stock after sale
    const updatedProducts = getProducts();
    const lowStockProducts = updatedProducts.filter(p => p.stock <= 2);
    
    if (lowStockProducts.length > 0) {
      lowStockProducts.forEach(product => {
        toast({
          title: "Low Stock Alert!",
          description: `${product.name} is running low (${product.stock} left)`,
          variant: "destructive",
        });
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sales</h1>
        <p className="text-muted-foreground">Process customer transactions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardHeader>
              <CardTitle className="text-card-foreground">Products</CardTitle>
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 bg-pos-product-card hover:bg-pos-product-card-hover rounded-lg border border-border transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-card-foreground">{product.name}</h3>
                      {product.category !== 'games' ? (
                        <Badge 
                          variant={product.stock <= 5 ? "destructive" : "secondary"}
                          className={product.stock <= 5 ? "bg-pos-inventory-low text-white" : ""}
                        >
                          {product.stock}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Service
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-success">
                        {formatPrice(product.price)}
                      </span>
                      <Button 
                        size="sm" 
                        className="bg-gradient-primary"
                        disabled={product.category !== 'games' && product.stock <= 0}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "No products found matching your search" : "No products available"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card className="bg-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <ShoppingCart className="w-5 h-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between p-3 bg-pos-product-card rounded-lg hover:bg-pos-product-card-hover transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="flex-1">
                    <h4 className="font-medium text-card-foreground">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium text-card-foreground">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(item.productId)}
                      className="h-8 w-8 p-0 text-destructive border-destructive hover:bg-destructive hover:text-white ml-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {cart.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Cart is empty</p>
                </div>
              )}
            </CardContent>
          </Card>

          {cart.length > 0 && (
            <Card className="bg-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-semibold text-card-foreground">Total:</span>
                    <span className="font-bold text-success text-xl">
                      {formatPrice(calculateTotal())}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={handleCheckout}
                    className="w-full bg-gradient-success text-white text-lg py-3 h-auto"
                    size="lg"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Complete Sale
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}