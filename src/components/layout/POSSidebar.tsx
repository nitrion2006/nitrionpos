import { useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3,
  Settings,
  Search,
  Menu,
  X
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/utils/localStorage";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Sales", url: "/sales", icon: ShoppingCart },
  { title: "Products", url: "/products", icon: Package },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

export function POSSidebar() {
  const [searchTerm, setSearchTerm] = useState("");
  const { state, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const products = getProducts();
  
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductClick = (productId: string) => {
    navigate("/products");
    setSearchTerm("");
  };

  return (
    <>
      {/* Collapse/Expand Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-background border border-border shadow-md hover:bg-accent transition-all duration-300 hover:scale-105"
      >
        {state === "collapsed" ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </Button>

      <Sidebar className="bg-pos-sidebar border-r border-border" collapsible="icon">
        <SidebarHeader className="p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            {state !== "collapsed" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground">POS System</h2>
                <p className="text-xs text-gray-600 dark:text-muted-foreground">Point of Sale</p>
              </div>
            )}
          </div>
          
          {/* Product Search */}
          {state !== "collapsed" && (
            <>
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-pos-product-card border-border text-foreground"
                />
              </div>
              
              {/* Search Results */}
              {searchTerm && (
                <div className="mt-2 bg-pos-product-card rounded-md border border-border max-h-32 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="p-2 text-sm text-foreground hover:bg-pos-product-card-hover cursor-pointer transition-all duration-300 hover:scale-105"
                        onClick={() => handleProductClick(product.id)}
                      >
                        <div className="font-medium text-gray-900 dark:text-foreground">{product.name}</div>
                        <div className="text-xs text-gray-600 dark:text-muted-foreground capitalize">${product.price} • {product.category} • Stock: {product.stock}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-600 dark:text-muted-foreground">No products found</div>
                  )}
                </div>
              )}
            </>
          )}
        </SidebarHeader>
        
        <SidebarContent>
          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-700 dark:text-muted-foreground">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="transition-all duration-300 hover:scale-105">
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/"}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 hover:shadow-lg ${
                            isActive 
                              ? "bg-pos-sidebar-active text-gray-900 dark:text-white shadow-pos-card" 
                              : "hover:bg-accent text-gray-900 dark:text-foreground hover:bg-pos-product-card-hover"
                          }`
                        }
                      >
                        <item.icon className="w-4 h-4" />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* System */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-700 dark:text-muted-foreground">System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="transition-all duration-300 hover:scale-105">
                    <NavLink 
                      to="/settings"
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 hover:shadow-lg ${
                          isActive 
                            ? "bg-pos-sidebar-active text-gray-900 dark:text-white shadow-pos-card" 
                            : "hover:bg-accent text-gray-900 dark:text-foreground hover:bg-pos-product-card-hover"
                        }`
                      }
                    >
                      <Settings className="w-4 h-4" />
                      {state !== "collapsed" && <span>Settings</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
