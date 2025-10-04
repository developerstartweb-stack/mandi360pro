import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import DashboardModule from "@/components/DashboardModule";
import MasterDataModule from "@/components/MasterDataModule";
import InventoryModule from "@/components/InventoryModule";
import BillDeskModule from "@/components/BillDeskModule";
import FarmerInvoiceModule from "@/components/FarmerInvoiceModule";
import AccountingModule from "@/components/AccountingModule";
import LedgerModule from "@/components/LedgerModule";
import ReportsModule from "@/components/ReportsModule";
import SettingsModule from "@/components/SettingsModule";
import WhatsAppModule from "@/components/WhatsAppModule";
import AccountingIntegrationModule from "@/components/AccountingIntegrationModule";
import LotForm from "@/components/LotForm";
import AccountForm from "@/components/AccountForm";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings, BarChart3, FileText } from "lucide-react";
import { GlobalProvider, useGlobalState } from "@/lib/globalState";

function MainContent({ activeTab }: { activeTab: string }) {
  const { state, setCurrentFY } = useGlobalState();
  const [showLotForm, setShowLotForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);

  if (showLotForm) {
    return (
      <div className="p-6">
        <LotForm 
          onSubmit={() => {
            setShowLotForm(false);
          }}
          onCancel={() => setShowLotForm(false)}
          currentFY={state.currentFY}
        />
      </div>
    );
  }

  if (showAccountForm) {
    return (
      <div className="p-6">
        <AccountForm 
          onSubmit={() => {
            setShowAccountForm(false);
          }}
          onCancel={() => setShowAccountForm(false)}
        />
      </div>
    );
  }

  // Helper function to determine which module to render based on sub-module activeTab
  const getModuleFromSubTab = (subTab: string) => {
    // Master Data sub-modules
    if (['account-master', 'product-master', 'product-expenses', 'place-master'].includes(subTab)) {
      return 'master-data';
    }
    // Inventory sub-modules
    if (['lot-entry', 'godown-awak', 'damage', 'weight-slip'].includes(subTab)) {
      return 'inventory';
    }
    // Bill Desk sub-modules
    if (['customer-billing', 'khata-billing', 'payment-receipts'].includes(subTab)) {
      return 'bill-desk';
    }
    // Farmer Invoice sub-modules
    if (['dhada-book', 'farmer-invoice-sub', 'manual-invoice'].includes(subTab)) {
      return 'farmer-invoice';
    }
    // Ledger sub-modules
    if (['uplag', 'khata', 'farmer-transport', 'income', 'expense', 'bank-deposit'].includes(subTab)) {
      return 'ledger';
    }
    // Reports sub-modules
    if (['daily-summary', 'product-wise', 'account-wise', 'financial-overview', 'inventory-status', 'outstanding-report'].includes(subTab)) {
      return 'reports';
    }
    // WhatsApp sub-modules
    if (['whatsapp-setup', 'messages', 'templates', 'whatsapp-settings'].includes(subTab)) {
      return 'whatsapp';
    }
    // Settings sub-modules
    if (['company-profile', 'default-expenses', 'printing-settings', 'module-settings'].includes(subTab)) {
      return 'settings';
    }
    return subTab; // Return the tab itself for main modules without sub-modules
  };

  const currentModule = getModuleFromSubTab(activeTab);

  switch (currentModule) {
    case "dashboard":
      return <DashboardModule />;
    
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
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Lots</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Lot management functionality will be implemented here
              </p>
            </CardContent>
          </Card>
        </div>
      );
    
    case "master-data":
      return <MasterDataModule activeSubModule={activeTab} />;
    
    case "inventory":
      return <InventoryModule activeSubModule={activeTab} />;
    
    case "bill-desk":
      return <BillDeskModule activeSubModule={activeTab} />;
    
    case "farmer-invoice":
      return <FarmerInvoiceModule activeSubModule={activeTab} />;
    
    case "accounting":
      return <AccountingModule />;

    case "accounting-integration":
      return <AccountingIntegrationModule />;
    
    case "ledger":
      return <LedgerModule activeSubModule={activeTab} />;
    
    case "reports":
      return <ReportsModule activeSubModule={activeTab} />;
    
    case "settings":
      return <SettingsModule activeSubModule={activeTab} />;
    
    case "whatsapp":
      return <WhatsAppModule activeSubModule={activeTab} />;

    case "accounts":
      return (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Accounts Management</h1>
              <p className="text-muted-foreground">Manage customer, farmer and broker accounts</p>
            </div>
            <Button onClick={() => setShowAccountForm(true)} className="gap-2" data-testid="button-create-account">
              <Plus className="h-4 w-4" />
              Create New Account
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="font-semibold">Customers</h3>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="font-semibold">Farmers</h3>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="font-semibold">Brokers</h3>
                  <p className="text-2xl font-bold text-orange-600">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case "transactions":
      return (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Transactions</h1>
              <p className="text-muted-foreground">Record and manage all financial transactions</p>
            </div>
            <Button className="gap-2" data-testid="button-create-transaction">
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
    
    
    
    default:
      return <DashboardModule />;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GlobalProvider>
          <AppContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        </GlobalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppContent({ 
  activeTab, 
  setActiveTab, 
  sidebarCollapsed, 
  setSidebarCollapsed 
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}) {
  const { state, setCurrentFY } = useGlobalState();
  const { toast } = useToast();

  // Universal keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            toast({
              title: "New Record",
              description: "Use the Add button in the active module"
            });
            break;
          case 's':
            e.preventDefault();
            toast({
              title: "Auto-save Active",
              description: "Your data is automatically saved"
            });
            break;
          case 'e':
            e.preventDefault();
            toast({
              title: "Edit Mode",
              description: "Use the Edit button in the active module"
            });
            break;
          case 'd':
            e.preventDefault();
            toast({
              title: "Delete Action",
              description: "Use the Delete button in the active module"
            });
            break;
          case 'p':
            e.preventDefault();
            toast({
              title: "Print/Export",
              description: "Use the Print button in the active module"
            });
            break;
          case 'r':
            e.preventDefault();
            window.location.reload();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toast]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={sidebarCollapsed}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          currentFY={state.currentFY}
          onFYChange={setCurrentFY}
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className="flex-1 overflow-auto">
          <MainContent activeTab={activeTab} />
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}

export default App;