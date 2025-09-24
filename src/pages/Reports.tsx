import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Package, 
  Download,
  ChevronLeft
} from "lucide-react";
import { getSales, getProducts, type Sale } from "@/utils/localStorage";
import { useCurrency } from "@/contexts/CurrencyContext";

type ViewType = 'default' | 'all-months' | 'current-month-days';

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products] = useState(getProducts());
  const [activeView, setActiveView] = useState<ViewType>('default');
  const { formatPrice } = useCurrency();
  
  useEffect(() => {
    setSales(getSales());
  }, []);

  const reportData = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Weekly sales
    const weeklySales = sales.filter(sale => sale.timestamp >= oneWeekAgo);
    const weeklyRevenue = weeklySales.reduce((sum, sale) => sum + sale.total, 0);
    
    // Monthly sales
    const monthlySales = sales.filter(sale => sale.timestamp >= oneMonthAgo);
    const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + sale.total, 0);
    
    // Top selling products
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    
    weeklySales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.quantity * item.price;
      });
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    // Daily sales for the week
    const dailySales: { [key: string]: number } = {};
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toDateString();
      dailySales[dateKey] = 0;
    }
    
    weeklySales.forEach(sale => {
      const dateKey = sale.timestamp.toDateString();
      if (dailySales.hasOwnProperty(dateKey)) {
        dailySales[dateKey] += sale.total;
      }
    });
    
    // Monthly data for all months
    const monthlyData: { [key: string]: { sales: number; revenue: number } } = {};
    sales.forEach(sale => {
      const monthKey = `${sale.timestamp.getFullYear()}-${String(sale.timestamp.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { sales: 0, revenue: 0 };
      }
      monthlyData[monthKey].sales += 1;
      monthlyData[monthKey].revenue += sale.total;
    });

    // Current month daily data
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const currentMonthSales = sales.filter(sale => 
      sale.timestamp >= currentMonthStart && sale.timestamp <= currentMonthEnd
    );
    
    const currentMonthDailySales: { [key: string]: number } = {};
    for (let d = new Date(currentMonthStart); d <= currentMonthEnd; d.setDate(d.getDate() + 1)) {
      const dateKey = new Date(d).toDateString();
      currentMonthDailySales[dateKey] = 0;
    }
    
    currentMonthSales.forEach(sale => {
      const dateKey = sale.timestamp.toDateString();
      if (currentMonthDailySales.hasOwnProperty(dateKey)) {
        currentMonthDailySales[dateKey] += sale.total;
      }
    });

    return {
      weeklySales: weeklySales.length,
      weeklyRevenue,
      monthlySales: monthlySales.length,
      monthlyRevenue,
      topProducts,
      dailySales,
      monthlyData,
      currentMonthDailySales,
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0)
    };
  }, [sales]);

  const handleBackToDefault = () => setActiveView('default');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {activeView !== 'default' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToDefault}
                className="mb-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {activeView === 'all-months' ? 'Monthly Sales Report' : 
             activeView === 'current-month-days' ? 'Daily Sales Report (Current Month)' : 
             'Reports'}
          </h1>
          <p className="text-muted-foreground">
            {activeView === 'all-months' ? 'Monthly sales breakdown and comparison' :
             activeView === 'current-month-days' ? 'Daily sales for the current month' :
             'Weekly sales analytics and insights'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="bg-gradient-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Weekly Sales</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {reportData.weeklySales}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Weekly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatPrice(reportData.weeklyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
          onClick={() => setActiveView('all-months')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Monthly Sales</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {reportData.monthlySales}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days • Click to view all months
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatPrice(reportData.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {reportData.totalSales}
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {formatPrice(reportData.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card className="bg-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Package className="w-5 h-5" />
              Top Selling Products (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-pos-product-card rounded-lg hover:bg-pos-product-card-hover transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium text-card-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.quantity} sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-card-foreground">
                    {formatPrice(product.revenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Revenue
                  </p>
                </div>
              </div>
            ))}
            {reportData.topProducts.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No sales data available for this week
              </p>
            )}
          </CardContent>
        </Card>

        {/* Daily Sales Chart (Simple) */}
        <Card 
          className="bg-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
          onClick={() => setActiveView('current-month-days')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Calendar className="w-5 h-5" />
              Daily Sales (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(reportData.dailySales).map(([date, revenue]) => {
              const maxRevenue = Math.max(...Object.values(reportData.dailySales));
              const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={date} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="font-medium text-card-foreground">
                      {formatPrice(revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-pos-product-card rounded-full h-2">
                    <div 
                      className="bg-gradient-success h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground text-center pt-2">
              Click to view current month's daily sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly View */}
      {activeView === 'all-months' && (
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-pos-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Monthly Sales Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(reportData.monthlyData)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([month, data]) => (
                    <div key={month} className="p-4 bg-pos-product-card rounded-lg hover:bg-pos-product-card-hover transition-colors">
                      <h3 className="font-medium text-card-foreground">
                        {new Date(month + '-01').toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </h3>
                      <p className="text-sm text-muted-foreground">{data.sales} sales</p>
                      <p className="text-lg font-bold text-success">{formatPrice(data.revenue)}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Comparison Chart */}
          <Card className="bg-card border-border shadow-pos-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Monthly Revenue Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(reportData.monthlyData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, data]) => {
                  const maxRevenue = Math.max(...Object.values(reportData.monthlyData).map(m => m.revenue));
                  const percentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={month} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {new Date(month + '-01').toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span className="font-medium text-card-foreground">
                          {formatPrice(data.revenue)}
                        </span>
                      </div>
                      <div className="w-full bg-pos-product-card rounded-full h-3">
                        <div 
                          className="bg-gradient-primary h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Month Daily View */}
      {activeView === 'current-month-days' && (
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-pos-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Daily Sales - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(reportData.currentMonthDailySales).map(([date, revenue]) => {
                const maxRevenue = Math.max(...Object.values(reportData.currentMonthDailySales));
                const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={date} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="font-medium text-card-foreground">
                        {formatPrice(revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-pos-product-card rounded-full h-2">
                      <div 
                        className="bg-gradient-success h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Sales - Only show in default view */}
      {activeView === 'default' && (
      <Card className="bg-card border-border shadow-pos-card transition-all duration-300 hover:shadow-lg hover:scale-105">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-card-foreground">
            <span className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Sales
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sales.slice(-10).reverse().map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 bg-pos-product-card rounded-lg hover:bg-pos-product-card-hover transition-all duration-300 hover:scale-105 cursor-pointer">
                <div>
                  <p className="font-medium text-card-foreground">
                    Sale #{sale.id.slice(-6)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {sale.items.length} items • {sale.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-success">
                    {formatPrice(sale.total)}
                  </p>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No sales recorded yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}