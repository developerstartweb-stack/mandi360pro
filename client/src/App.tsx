import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import DashboardModule from "@/components/DashboardModule";
import MasterDataModule from "@/components/MasterDataModule";
import InventoryModule from "@/components/InventoryModule";
import LotForm from "@/components/LotForm";
import AccountForm from "@/components/AccountForm";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, BarChart3, FileText } from "lucide-react";

function MainContent({ activeTab, currentFY, onFYChange }: { activeTab: string; currentFY: string; onFYChange: (fy: string) => void }) {
  const [showLotForm, setShowLotForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);

  if (showLotForm) {
    return (
      <div className="p-6">
        <LotForm 
          onSubmit={(data) => {
            console.log('Lot created:', data);
            setShowLotForm(false);
          }}
          onCancel={() => setShowLotForm(false)}
        />
      </div>
    );
  }

  if (showAccountForm) {
    return (
      <div className="p-6">
        <AccountForm 
          onSubmit={(data) => {
            console.log('Account created:', data);
            setShowAccountForm(false);
          }}
          onCancel={() => setShowAccountForm(false)}
        />
      </div>
    );
  }

  switch (activeTab) {
    case "dashboard":
      return <DashboardModule currentFY={currentFY} onFYChange={onFYChange} />;
    
    case "lots":
      return (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Lots Management</h1>
              <p className="text-muted-foreground">Manage all mandi lots and inventory</p>
            </div>
            <Button onClick={() => setShowLotForm(true)} className="gap-2" data-testid="button-create-lot">
              <Plus className="h-4 w-4" />
              Create New Lot
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Lots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Currently in mandi</p>
              </CardContent>
            </Card>
            
            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Awaiting buyers</p>
              </CardContent>
            </Card>
            
            <Card className="hover-elevate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">₹2,45,000</div>
                <p className="text-xs text-muted-foreground">From 7 sales</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Lots</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Lot listing functionality will be implemented here
              </p>
            </CardContent>
          </Card>
        </div>
      );
    
    case "accounts":
      return (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Accounts Management</h1>
              <p className="text-muted-foreground">Manage buyers, sellers, farmers, and agents</p>
            </div>
            <Button onClick={() => setShowAccountForm(true)} className="gap-2" data-testid="button-create-account">
              <Plus className="h-4 w-4" />
              Create New Account
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: "Buyers", count: 45, color: "bg-blue-500" },
              { type: "Sellers", count: 32, color: "bg-green-500" },
              { type: "Farmers", count: 58, color: "bg-yellow-500" },
              { type: "Agents", count: 10, color: "bg-purple-500" }
            ].map((item) => (
              <Card key={item.type} className="hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <div>
                      <p className="text-sm font-medium">{item.type}</p>
                      <p className="text-2xl font-bold">{item.count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Account listing and management functionality will be implemented here
              </p>
            </CardContent>
          </Card>
        </div>
      );
    
    case "master-data":
    case "account-master":
    case "product-master":
    case "product-expenses":
    case "place-master":
      return <MasterDataModule currentFY={currentFY} onFYChange={onFYChange} />;
    
    case "inventory":
    case "lot-entry":
    case "godown-awak":
    case "damage":
    case "weight-slip":
      return <InventoryModule currentFY={currentFY} onFYChange={onFYChange} />;
    
    case "transactions":
      return (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Transactions</h1>
              <p className="text-muted-foreground">Track all mandi transactions and payments</p>
            </div>
            <Button className="gap-2" data-testid="button-new-transaction">
              <Plus className="h-4 w-4" />
              Record Transaction
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Transaction management functionality will be implemented here
              </p>
            </CardContent>
          </Card>
        </div>
      );
    
    case "reports":
      return (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Reports & Analytics</h1>
              <p className="text-muted-foreground">Financial Year {currentFY} Reports</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" data-testid="button-export-csv">
                <FileText className="h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" className="gap-2" data-testid="button-export-json">
                <FileText className="h-4 w-4" />
                Export JSON
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Revenue Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Revenue charts and analysis will be implemented here
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Product Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Product performance metrics will be implemented here
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    
    case "settings":
      return (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Settings</h1>
              <p className="text-muted-foreground">Configure your mandi management system</p>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  FY Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Financial Year</span>
                  <Badge>{currentFY}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto FY Detection</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <Button variant="outline" className="w-full" data-testid="button-fy-settings">
                  Configure FY Settings
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" data-testid="button-backup">
                  Create Data Backup
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-import">
                  Import Data
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-export-all">
                  Export All Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    
    default:
      return <DashboardModule currentFY={currentFY} onFYChange={onFYChange} />;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentFY, setCurrentFY] = useState("2025-26");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auto-detect FY based on current date (as specified in requirements)
  useState(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // getMonth() is 0-indexed
    
    // Indian FY starts from April (month 4)
    if (currentMonth >= 4) {
      setCurrentFY(`${currentYear}-${String(currentYear + 1).slice(-2)}`);
    } else {
      setCurrentFY(`${currentYear - 1}-${String(currentYear).slice(-2)}`);
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-background">
          <Sidebar 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isCollapsed={sidebarCollapsed}
          />
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header 
              currentFY={currentFY}
              onFYChange={setCurrentFY}
              onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            
            <main className="flex-1 overflow-auto">
              <MainContent activeTab={activeTab} currentFY={currentFY} onFYChange={setCurrentFY} />
            </main>
          </div>
        </div>
        
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
