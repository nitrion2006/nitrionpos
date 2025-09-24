import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { POSLayout } from "@/components/layout/POSLayout";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <CurrencyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <POSLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/products" element={<Products />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </POSLayout>
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
