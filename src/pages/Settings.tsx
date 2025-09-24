import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Moon, Sun, Users, Mail, Shield, DollarSign } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useCurrency, currencies } from "@/contexts/CurrencyContext";
import AccountManagementCard from "@/components/AccountManagementCard";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your POS system preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Theme Settings */}
        <Card className="bg-card border-border shadow-pos-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Sun className="w-5 h-5" />
              Theme Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-card-foreground">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark theme
                </p>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label className="text-card-foreground">System Preferences</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={theme === 'light' ? 'default' : 'outline'} 
                  size="sm" 
                  className="justify-start"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Light
                </Button>
                <Button 
                  variant={theme === 'dark' ? 'default' : 'outline'} 
                  size="sm" 
                  className="justify-start"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="bg-card border-border shadow-pos-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Users className="w-5 h-5" />
              Account Management
            </CardTitle>
          </CardHeader>
        <CardContent>
  <AccountManagementCard />
</CardContent>
        </Card>

        {/* System Settings */}
        <Card className="bg-card border-border shadow-pos-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <SettingsIcon className="w-5 h-5" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-card-foreground">Auto-save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save changes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-card-foreground">Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when inventory is low
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-card-foreground">Sound Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Play sounds for actions
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-card border-border shadow-pos-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Shield className="w-5 h-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Data Storage</Label>
              <p className="text-sm text-muted-foreground">
                Currently using localStorage (local only)
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                Import Data
              </Button>
            </div>
            
            <Button variant="destructive" size="sm" className="w-full">
              Clear All Data
            </Button>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card className="bg-card border-border shadow-pos-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <DollarSign className="w-5 h-5" />
              Currency Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-card-foreground">Default Currency</Label>
              <Select 
                value={currency.code} 
                onValueChange={(value) => {
                  const selectedCurrency = currencies.find(c => c.code === value);
                  if (selectedCurrency) setCurrency(selectedCurrency);
                }}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      <div className="flex items-center gap-2">
                        <span>{curr.symbol}</span>
                        <span>{curr.name} ({curr.code})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                This will be displayed across all pages and reports
              </p>
            </div>
            
            <div className="bg-pos-product-card p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Current: <span className="font-medium text-card-foreground">{currency.name} ({currency.symbol})</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
