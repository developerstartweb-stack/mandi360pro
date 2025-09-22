import { useState, useEffect, useContext, createContext, useCallback } from "react";
import { useQueries } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Global State Management Context with FY-scoped data
interface GlobalState {
  currentFY: string;
  companyProfile: {
    companyName: string;
    address?: string;
    phone1?: string;
    phone2?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
  } | null;
  masterData: {
    accountsByFY: Record<string, any[]>;
    productsByFY: Record<string, any[]>;
    placesByFY: Record<string, any[]>;
    expensesByFY: Record<string, any[]>;
    // Legacy flat arrays for backward compatibility
    accounts: any[];
    products: any[];
    places: any[];
    expenses: any[];
  };
  activeData: {
    lotsByFY: Record<string, any[]>;
    billsByFY: Record<string, any[]>;
    invoicesByFY: Record<string, any[]>;
    transactionsByFY: Record<string, any[]>;
    // Legacy flat arrays for backward compatibility
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
  updateCompanyProfile: (profile: GlobalState['companyProfile']) => void;
  setCurrentFY: (fy: string) => void;
  isLoading: boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalState must be used within GlobalProvider');
  }
  return context;
};

// Global State Provider Component
export function GlobalProvider({ children }: { children: React.ReactNode }) {
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
      companyProfile: null,
      masterData: {
        accountsByFY: {},
        productsByFY: {},
        placesByFY: {},
        expensesByFY: {},
        // Legacy flat arrays for backward compatibility
        accounts: [],
        products: [],
        places: [],
        expenses: []
      },
      activeData: {
        lotsByFY: {},
        billsByFY: {},
        invoicesByFY: {},
        transactionsByFY: {},
        // Legacy flat arrays for backward compatibility
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

  // Centralized data loading for the current FY
  const dataQueries = useQueries({
    queries: [
      {
        queryKey: ["/api/company-profiles", state.currentFY],
        queryFn: async () => {
          const url = new URL('/api/company-profiles', window.location.origin);
          url.searchParams.set('fy', state.currentFY);
          const response = await fetch(url.toString());
          if (!response.ok) throw new Error('Failed to fetch company profiles');
          const profiles = await response.json();
          return profiles.length > 0 ? profiles[0] : null; // Return first profile or null
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - company profile changes less frequently
      },
      {
        queryKey: ["/api/accounts", state.currentFY],
        queryFn: async () => {
          const url = new URL('/api/accounts', window.location.origin);
          url.searchParams.set('fy', state.currentFY);
          const response = await fetch(url.toString());
          if (!response.ok) throw new Error('Failed to fetch accounts');
          return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      {
        queryKey: ["/api/products", state.currentFY],
        queryFn: async () => {
          const url = new URL('/api/products', window.location.origin);
          url.searchParams.set('fy', state.currentFY);
          const response = await fetch(url.toString());
          if (!response.ok) throw new Error('Failed to fetch products');
          return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      {
        queryKey: ["/api/places", state.currentFY],
        queryFn: async () => {
          const url = new URL('/api/places', window.location.origin);
          url.searchParams.set('fy', state.currentFY);
          const response = await fetch(url.toString());
          if (!response.ok) throw new Error('Failed to fetch places');
          return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      {
        queryKey: ["/api/expenses", state.currentFY],
        queryFn: async () => {
          const url = new URL('/api/expenses', window.location.origin);
          url.searchParams.set('fy', state.currentFY);
          const response = await fetch(url.toString());
          if (!response.ok) throw new Error('Failed to fetch expenses');
          return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      {
        queryKey: ["/api/inventory/lot-entry", state.currentFY],
        queryFn: async () => {
          const url = new URL('/api/inventory/lot-entry', window.location.origin);
          url.searchParams.set('fy', state.currentFY);
          const response = await fetch(url.toString());
          if (!response.ok) throw new Error('Failed to fetch lots');
          return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    ],
  });

  // Check if any queries are loading
  const isLoading = dataQueries.some(query => query.isLoading);

  // Update global state when centralized data is fetched
  useEffect(() => {
    const [companyProfileQuery, accountsQuery, productsQuery, placesQuery, expensesQuery, lotsQuery] = dataQueries;

    let stateUpdated = false;
    const newState = { ...state };

    if (companyProfileQuery.data && companyProfileQuery.data !== state.companyProfile) {
      newState.companyProfile = companyProfileQuery.data;
      stateUpdated = true;
    }

    if (accountsQuery.data && accountsQuery.data !== state.masterData.accounts) {
      newState.masterData = {
        ...newState.masterData,
        accountsByFY: { ...newState.masterData.accountsByFY, [state.currentFY]: accountsQuery.data },
        accounts: accountsQuery.data
      };
      stateUpdated = true;
    }

    if (productsQuery.data && productsQuery.data !== state.masterData.products) {
      newState.masterData = {
        ...newState.masterData,
        productsByFY: { ...newState.masterData.productsByFY, [state.currentFY]: productsQuery.data },
        products: productsQuery.data
      };
      stateUpdated = true;
    }

    if (placesQuery.data && placesQuery.data !== state.masterData.places) {
      newState.masterData = {
        ...newState.masterData,
        placesByFY: { ...newState.masterData.placesByFY, [state.currentFY]: placesQuery.data },
        places: placesQuery.data
      };
      stateUpdated = true;
    }

    if (expensesQuery.data && expensesQuery.data !== state.masterData.expenses) {
      newState.masterData = {
        ...newState.masterData,
        expensesByFY: { ...newState.masterData.expensesByFY, [state.currentFY]: expensesQuery.data },
        expenses: expensesQuery.data
      };
      stateUpdated = true;
    }

    if (lotsQuery.data && lotsQuery.data !== state.activeData.lots) {
      newState.activeData = {
        ...newState.activeData,
        lotsByFY: { ...newState.activeData.lotsByFY, [state.currentFY]: lotsQuery.data },
        lots: lotsQuery.data
      };
      stateUpdated = true;
    }

    if (stateUpdated) {
      setState(newState);
    }
  }, [dataQueries.map(q => q.data), state.currentFY]);

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
        [type]: data,
        // Also update FY-scoped data if it's one of the FY-scoped types
        ...(type.endsWith('ByFY') ? {} : {
          [`${type}ByFY`]: { ...prevState.masterData[`${type}ByFY` as keyof typeof prevState.masterData], [prevState.currentFY]: data }
        })
      }
    }));
  }, []);

  const updateActiveData = useCallback((type: keyof GlobalState['activeData'], data: any[]) => {
    setState(prevState => ({
      ...prevState,
      activeData: {
        ...prevState.activeData,
        [type]: data,
        // Also update FY-scoped data if it's one of the FY-scoped types
        ...(type.endsWith('ByFY') ? {} : {
          [`${type}ByFY`]: { ...prevState.activeData[`${type}ByFY` as keyof typeof prevState.activeData], [prevState.currentFY]: data }
        })
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

  const updateCompanyProfile = useCallback((profile: GlobalState['companyProfile']) => {
    setState(prevState => ({
      ...prevState,
      companyProfile: profile
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
          masterData: { 
            ...prevState.masterData,
            accounts: [], products: [], places: [], expenses: [] 
          },
          activeData: { 
            ...prevState.activeData,
            lots: [], bills: [], invoices: [], transactions: [] 
          }
        }));
      }
    } else {
      // Create fresh state for new FY
      setState(prevState => ({
        ...prevState,
        currentFY: fy,
        masterData: { 
          ...prevState.masterData,
          accounts: [], products: [], places: [], expenses: [] 
        },
        activeData: { 
          ...prevState.activeData,
          lots: [], bills: [], invoices: [], transactions: [] 
        }
      }));
    }
    
    toast({
      title: "Financial Year Changed",
      description: `Switched to FY ${fy}`
    });
  }, [state, toast]);

  return (
    <GlobalContext.Provider value={{
      state,
      updateMasterData,
      updateActiveData,
      updatePreferences,
      updateCompanyProfile,
      setCurrentFY,
      isLoading
    }}>
      {children}
    </GlobalContext.Provider>
  );
}