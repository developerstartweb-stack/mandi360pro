import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect, useCallback, createContext, useContext } from "react";
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
import LotForm from "@/components/LotForm";
import AccountForm from "@/components/AccountForm";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings, BarChart3, FileText } from "lucide-react";

// Global State Management Context
interface GlobalState {
  currentFY: string;
  masterData: {
    accounts: any[];
    products: any[];
    places: any[];
    expenses: any[];
  };
  activeData: {
    lots: any[];
    bills: any[];
    invoices: any[];
    transactions: any[];
  };
  preferences: {
    autoSave: boolean;
    notifications: boolean;
    multiWindow: boolean;
  };
}

interface GlobalContextType {
  state: GlobalState;
  updateMasterData: (type: keyof GlobalState['masterData'], data: any[]) => void;
  updateActiveData: (type: keyof GlobalState['activeData'], data: any[]) => void;
  updatePreferences: (prefs: Partial<GlobalState['preferences']>) => void;
  setCurrentFY: (fy: string) => void;
  syncData: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalState must be used within GlobalProvider');
  }
  return context;
};

function MainContent({ activeTab }: { activeTab: string }) {
  const { state, setCurrentFY } = useGlobalState();
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
      return <DashboardModule currentFY={state.currentFY} onFYChange={setCurrentFY} />;
    
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
      return <MasterDataModule currentFY={state.currentFY} onFYChange={setCurrentFY} />;
    
    case "inventory":
    case "lot-entry":
    case "godown-awak":
    case "damage":
    case "weight-slip":
      return <InventoryModule currentFY={state.currentFY} onFYChange={setCurrentFY} />;
    
    case "bill-desk":
      return <BillDeskModule currentFY={state.currentFY} onFYChange={setCurrentFY} />;
    
    case "farmer-invoice":
      return <FarmerInvoiceModule currentFY={state.currentFY} onFYChange={setCurrentFY} />;
    
    case "accounting":
      return <AccountingModule currentFY={state.currentFY} onFYChange={setCurrentFY} />;
    
    case "ledger":
      return <LedgerModule currentFY={state.currentFY} onFYChange={setCurrentFY} />;
    
    case "reports":
      return (
        <div className="p-6">
          <ReportsModule />
        </div>
      );
    
    case "settings":
      return <SettingsModule />;
    
    case "whatsapp":
      return <WhatsAppModule />;
    
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
    
    
    
    default:
      return <DashboardModule currentFY={state.currentFY} onFYChange={setCurrentFY} />;
  }
}

// Global State Provider Component
function GlobalProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [state, setState] = useState<GlobalState>(() => {
    // Initialize from localStorage with auto-detected FY
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    // Indian FY starts from April (month 4)
    const autoFY = currentMonth >= 4 
      ? `${currentYear}-${String(currentYear + 1).slice(-2)}`
      : `${currentYear - 1}-${String(currentYear).slice(-2)}`;

    const savedState = localStorage.getItem(`mandi360pro-global-${autoFY}`);
    const defaultState: GlobalState = {
      currentFY: autoFY,
      masterData: {
        accounts: [],
        products: [],
        places: [],
        expenses: []
      },
      activeData: {
        lots: [],
        bills: [],
        invoices: [],
        transactions: []
      },
      preferences: {
        autoSave: true,
        notifications: true,
        multiWindow: true
      }
    };
    
    return savedState ? { ...defaultState, ...JSON.parse(savedState) } : defaultState;
  });

  // Auto-save state to localStorage (with FY transition guard)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.currentFY) { // Only save if FY is properly set
        localStorage.setItem(`mandi360pro-global-${state.currentFY}`, JSON.stringify(state));
      }
    }, 500); // Debounce saves
    
    return () => clearTimeout(timeoutId);
  }, [state]);

  // Multi-window synchronization
  useEffect(() => {
    if (!state.preferences.multiWindow) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `mandi360pro-global-${state.currentFY}` && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          setState(prevState => ({ ...prevState, ...newState }));
          toast({
            title: "Data Synced",
            description: "Application data updated from another window"
          });
        } catch (error) {
          console.error('Error syncing global state:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state.currentFY, state.preferences.multiWindow, toast]);

  // Auto-cleanup trash data (30-day rule)
  useEffect(() => {
    const cleanupTrash = () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Clean up old data from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('mandi360pro-trash-')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.deletedAt && new Date(data.deletedAt) < thirtyDaysAgo) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            console.error('Error cleaning up trash:', error);
          }
        }
      });
    };

    // Run cleanup daily
    const interval = setInterval(cleanupTrash, 24 * 60 * 60 * 1000);
    cleanupTrash(); // Run immediately
    
    return () => clearInterval(interval);
  }, []);

  const updateMasterData = useCallback((type: keyof GlobalState['masterData'], data: any[]) => {
    setState(prevState => ({
      ...prevState,
      masterData: {
        ...prevState.masterData,
        [type]: data
      }
    }));
  }, []);

  const updateActiveData = useCallback((type: keyof GlobalState['activeData'], data: any[]) => {
    setState(prevState => ({
      ...prevState,
      activeData: {
        ...prevState.activeData,
        [type]: data
      }
    }));
  }, []);

  const updatePreferences = useCallback((prefs: Partial<GlobalState['preferences']>) => {
    setState(prevState => ({
      ...prevState,
      preferences: {
        ...prevState.preferences,
        ...prefs
      }
    }));
  }, []);

  const setCurrentFY = useCallback((fy: string) => {
    // Save current state before switching
    localStorage.setItem(`mandi360pro-global-${state.currentFY}`, JSON.stringify(state));
    
    // Load data for the new FY
    const savedFYData = localStorage.getItem(`mandi360pro-global-${fy}`);
    
    if (savedFYData) {
      try {
        const fyData = JSON.parse(savedFYData);
        setState({ ...fyData, currentFY: fy });
      } catch (error) {
        console.error('Error loading FY data:', error);
        // Fallback to default state for this FY
        setState(prevState => ({
          ...prevState,
          currentFY: fy,
          masterData: { accounts: [], products: [], places: [], expenses: [] },
          activeData: { lots: [], bills: [], invoices: [], transactions: [] }
        }));
      }
    } else {
      // Create fresh state for new FY
      setState(prevState => ({
        ...prevState,
        currentFY: fy,
        masterData: { accounts: [], products: [], places: [], expenses: [] },
        activeData: { lots: [], bills: [], invoices: [], transactions: [] }
      }));
    }
    
    toast({
      title: "Financial Year Changed",
      description: `Switched to FY ${fy} with ${savedFYData ? 'existing' : 'new'} data`
    });
  }, [state, toast]);

  const syncData = useCallback(() => {
    // Force sync across all windows by updating localStorage (triggers storage event in other windows)
    if (state.currentFY) {
      localStorage.setItem(`mandi360pro-global-${state.currentFY}`, JSON.stringify(state));
      
      // Also dispatch to current window for immediate feedback
      const event = new StorageEvent('storage', {
        key: `mandi360pro-global-${state.currentFY}`,
        newValue: JSON.stringify(state)
      });
      window.dispatchEvent(event);
    }
  }, [state]);

  const contextValue: GlobalContextType = {
    state,
    updateMasterData,
    updateActiveData,
    updatePreferences,
    setCurrentFY,
    syncData
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
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
