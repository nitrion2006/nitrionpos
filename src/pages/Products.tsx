import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Plus, Trash2, Package, DollarSign, Hash, Edit, MoreHorizontal, ShoppingCart, TrendingUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getProducts, addProduct, removeProduct, updateProduct, type Product } from "@/utils/localStorage";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'stationaries' | 'accessories' | 'tools' | 'games'>('all');
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    buyingPrice: "",
    sellingPrice: "",
    stock: "",
    category: "stationaries" as 'stationaries' | 'accessories' | 'tools' | 'games',
  });
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = ['name', 'price'];
    if (formData.category !== 'games') {
      requiredFields.push('stock');
    }
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);
    const buyingPrice = formData.buyingPrice ? parseFloat(formData.buyingPrice) : undefined;
    const sellingPrice = formData.sellingPrice ? parseFloat(formData.sellingPrice) : undefined;
    const stock = formData.category === 'games' ? 0 : parseInt(formData.stock);

    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    if (formData.category !== 'games' && (isNaN(stock) || stock < 0)) {
      toast({
        title: "Error",
        description: "Please enter a valid stock value",
        variant: "destructive",
      });
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        price,
        buyingPrice,
        sellingPrice,
        stock,
        category: formData.category,
      });
      
      toast({
        title: "Success",
        description: `${formData.name} has been updated`,
      });
    } else {
      const newProduct = addProduct({
        name: formData.name,
        price,
        buyingPrice,
        sellingPrice,
        stock,
        category: formData.category,
      });
      
      toast({
        title: "Success",
        description: `${newProduct.name} has been added to inventory`,
      });
    }

    setProducts(getProducts());
    setFormData({ name: "", price: "", buyingPrice: "", sellingPrice: "", stock: "", category: "stationaries" });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleRemove = (productId: string, productName: string) => {
    removeProduct(productId);
    setProducts(getProducts());
    
    toast({
      title: "Product Removed",
      description: `${productName} has been removed from inventory`,
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      buyingPrice: product.buyingPrice?.toString() || "",
      sellingPrice: product.sellingPrice?.toString() || "",
      stock: product.stock.toString(),
      category: product.category,
    });
    setIsDialogOpen(true);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your inventory</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProduct(null);
            setFormData({ name: "", price: "", buyingPrice: "", sellingPrice: "", stock: "", category: "stationaries" });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 transition-pos">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-card-foreground">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  className="bg-input border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="price" className="text-card-foreground">Selling Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  className="bg-input border-border text-foreground"
                />
              </div>

              {formData.category !== 'games' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buyingPrice" className="text-card-foreground">Buying Price</Label>
                      <Input
                        id="buyingPrice"
                        type="number"
                        step="0.01"
                        value={formData.buyingPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, buyingPrice: e.target.value }))}
                        placeholder="0.00"
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sellingPrice" className="text-card-foreground">Selling Price</Label>
                      <Input
                        id="sellingPrice"
                        type="number"
                        step="0.01"
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                        placeholder="0.00"
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stock" className="text-card-foreground">
                      {editingProduct ? 'Stock' : 'Initial Stock'}
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder="0"
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                </>
              )}

              {formData.category === 'games' && (
                <div className="text-sm text-muted-foreground bg-pos-product-card p-3 rounded-lg">
                  <p className="font-medium">Service Category</p>
                  <p>Games are services and don't require stock management.</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="category" className="text-card-foreground">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: 'stationaries' | 'accessories' | 'tools' | 'games') => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stationaries">Stationaries</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="games">Games</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-gradient-primary">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-border text-foreground"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="stationaries">Stationaries</TabsTrigger>
          <TabsTrigger value="accessories">Accessories</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedCategory} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-pos-product-card hover:bg-pos-product-card-hover border-border shadow-pos-card transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-card-foreground">{product.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1 capitalize">
                        {product.category}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 border-muted-foreground text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem 
                          onClick={() => handleEdit(product)}
                          className="text-card-foreground hover:bg-accent cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRemove(product.id, product.name)}
                          className="text-destructive hover:bg-destructive hover:text-white cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Product
                        </DropdownMenuItem>
                        {product.buyingPrice && (
                          <DropdownMenuItem disabled className="text-muted-foreground">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Buying: {formatPrice(product.buyingPrice)}
                          </DropdownMenuItem>
                        )}
                        {product.sellingPrice && (
                          <DropdownMenuItem disabled className="text-muted-foreground">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Selling: {formatPrice(product.sellingPrice)}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-success" />
                  <span className="text-lg font-bold text-card-foreground">
                    {formatPrice(product.price)}
                  </span>
                </div>
                
                {product.category !== 'games' ? (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Stock:</span>
                    <Badge 
                      variant={product.stock <= 5 ? "destructive" : "secondary"}
                      className={product.stock <= 5 ? "bg-pos-inventory-low text-white" : ""}
                    >
                      {product.stock}
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Service
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">ID: {product.id}</span>
                </div>
              </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && products.length > 0 && (
          <Card className="bg-card border-border shadow-pos-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No Products in {selectedCategory}</h3>
              <p className="text-muted-foreground text-center mb-4">
                No products found in this category
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>

    {products.length === 0 && (
        <Card className="bg-card border-border shadow-pos-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No Products Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by adding your first product to the inventory
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}