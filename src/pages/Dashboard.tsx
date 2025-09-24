import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  AlertTriangle 
} from "lucide-react";
import { getProducts, getSales } from "@/utils/localStorage";
import { useMemo } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Dashboard() {
  const products = getProducts();
  const sales = getSales();
  const { formatPrice } = useCurrency();
  
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = sales.length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock <= 5 && p.category !== 'games');
    
    const today = new Date();
    const todaysSales = sales.filter(sale => 
      sale.timestamp.toDateString() === today.toDateString()
    );
    const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
    
    return {
      totalRevenue,
      totalSales,
      totalProducts,
      lowStockProducts,
      todaysRevenue,
      todaysSalesCount: todaysSales.length,
    };
  }, [products, sales]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your POS system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-pos-product-card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatPrice(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.totalSales} sales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-pos-product-card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Today's Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatPrice(stats.todaysRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.todaysSalesCount} transactions today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-pos-product-card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Products</CardTitle>
            <Package className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {stats.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              Active products
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-pos-product-card-hover cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {stats.lowStockProducts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Items need restocking
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-pos-product-card cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <TrendingUp className="w-5 h-5" />
              Recent Sales Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sales.slice(-5).reverse().map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-pos-product-card rounded-lg transition-colors duration-200 hover:bg-pos-product-card-hover">
                <div>
                  <p className="font-medium text-card-foreground">
                    Sale #{sale.id.slice(-4)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {sale.items.length} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-card-foreground">
                    {formatPrice(sale.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sale.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No sales recorded yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:bg-pos-product-card cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <AlertTriangle className="w-5 h-5" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-pos-product-card rounded-lg transition-colors duration-200 hover:bg-pos-product-card-hover">
                <div>
                  <p className="font-medium text-card-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <Badge 
                  variant={product.stock <= 2 ? "destructive" : "secondary"}
                  className="bg-pos-inventory-low text-white"
                >
                  {product.stock} left
                </Badge>
              </div>
            ))}
            {stats.lowStockProducts.length === 0 && (
              <p className="text-success text-center py-4">
                All products are well stocked!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}