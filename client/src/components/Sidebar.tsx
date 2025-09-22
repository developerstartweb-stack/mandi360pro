import { 
  Home, 
  FileText, 
  BarChart3, 
  Settings,
  TrendingUp,
  Building,
  Database,
  ChevronDown,
  ChevronUp,
  Users,
  Package,
  DollarSign,
  MapPin,
  Plus,
  AlertTriangle,
  Scale,
  Receipt,
  BookOpen,
  MessageSquare,
  Truck,
  PieChart,
  Wallet,
  Clock,
  Bell,
  Activity,
  Zap,
  CreditCard,
  ArrowUpCircle,
  Building2,
  Cog,
  Printer,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isCollapsed?: boolean;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, color: "text-blue-500" },
  { 
    id: "master-data", 
    label: "Master Data", 
    icon: Database,
    color: "text-green-500",
    hasDropdown: true,
    subItems: [
      { id: "account-master", label: "Account Master", icon: Users },
      { id: "product-master", label: "Product Master", icon: Package },
      { id: "product-expenses", label: "Product Expenses", icon: DollarSign },
      { id: "place-master", label: "Place Master", icon: MapPin }
    ]
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    color: "text-orange-500",
    hasDropdown: true,
    subItems: [
      { id: "lot-entry", label: "Lot Entry", icon: Plus },
      { id: "godown-awak", label: "Godown Awak", icon: Building },
      { id: "damage", label: "Damage", icon: AlertTriangle },
      { id: "weight-slip", label: "Weight Slip", icon: Scale }
    ]
  },
  { 
    id: "bill-desk", 
    label: "Bill Desk", 
    icon: Receipt, 
    color: "text-purple-500",
    hasDropdown: true,
    subItems: [
      { id: "customer-billing", label: "Customer Billing", icon: DollarSign },
      { id: "khata-billing", label: "Khata Billing", icon: CreditCard },
      { id: "payment-receipts", label: "Payment Receipts", icon: Receipt }
    ]
  },
  { 
    id: "farmer-invoice", 
    label: "Farmer Invoice", 
    icon: FileText, 
    color: "text-indigo-500",
    hasDropdown: true,
    subItems: [
      { id: "dhada-book", label: "Dhada Book", icon: BookOpen },
      { id: "farmer-invoice-sub", label: "Farmer Invoice", icon: Receipt },
      { id: "manual-invoice", label: "Manual Invoice", icon: FileText }
    ]
  },
  { id: "accounting", label: "Accounting", icon: Wallet, color: "text-yellow-500" },
  { 
    id: "ledger", 
    label: "Ledger Module", 
    icon: BookOpen, 
    color: "text-teal-500",
    hasDropdown: true,
    subItems: [
      { id: "uplag", label: "Uplag (Balance)", icon: ArrowUpCircle },
      { id: "khata", label: "Khata", icon: Users },
      { id: "farmer-transport", label: "Farmer/Transport", icon: Truck },
      { id: "income", label: "Income", icon: TrendingUp },
      { id: "expense", label: "Expense", icon: CreditCard },
      { id: "bank-deposit", label: "Bank Deposit", icon: Building2 }
    ]
  },
  { 
    id: "reports", 
    label: "Reports", 
    icon: BarChart3, 
    color: "text-red-500",
    hasDropdown: true,
    subItems: [
      { id: "daily-summary", label: "Daily Summary", icon: Clock },
      { id: "product-wise", label: "Product Wise", icon: Package },
      { id: "account-wise", label: "Account Wise", icon: Users },
      { id: "financial-overview", label: "Financial Overview", icon: DollarSign },
      { id: "inventory-status", label: "Inventory Status", icon: Package },
      { id: "outstanding-report", label: "Outstanding Report", icon: AlertTriangle }
    ]
  },
  { id: "analytics", label: "Analytics", icon: TrendingUp, color: "text-pink-500" },
  { 
    id: "whatsapp", 
    label: "WhatsApp", 
    icon: MessageSquare, 
    color: "text-green-600",
    hasDropdown: true,
    subItems: [
      { id: "messages", label: "Messages", icon: MessageSquare },
      { id: "templates", label: "Templates", icon: FileText },
      { id: "whatsapp-settings", label: "Settings", icon: Settings }
    ]
  },
  { 
    id: "settings", 
    label: "Settings", 
    icon: Settings, 
    color: "text-gray-500",
    hasDropdown: true,
    subItems: [
      { id: "company-profile", label: "Company Profile", icon: Building },
      { id: "default-expenses", label: "Default Expenses", icon: DollarSign },
      { id: "printing-settings", label: "Printing Settings", icon: Printer },
      { id: "module-settings", label: "Module Settings", icon: Cog }
    ]
  },
];

export default function Sidebar({ activeTab = "dashboard", onTabChange, isCollapsed = false }: SidebarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Mock data for quick stats (will be replaced with global state later)
  const quickStats = {
    activeLots: 12,
    todayRevenue: 245000,
    pendingBills: 5,
    totalAccounts: 45,
    totalProducts: 8
  };

  const toggleDropdown = (itemId: string) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId);
  };

  const handleItemClick = (itemId: string, hasDropdown?: boolean) => {
    if (hasDropdown) {
      toggleDropdown(itemId);
    } else {
      onTabChange?.(itemId);
    }
  };

  return (
    <aside className={cn(
      "bg-sidebar border-r border-sidebar-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        {!isCollapsed && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-6 w-6 text-primary" />
              <h2 className="font-display font-semibold text-sidebar-foreground">
                Mandi Operations
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">FY 2025-26 Active</p>
          </div>
        )}

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeTab));
            const isDropdownOpen = openDropdown === item.id;
            
            return (
              <div key={item.id} className="relative">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10 transition-all duration-200 hover-elevate",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm",
                    !isActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed && "px-2"
                  )}
                  onClick={() => handleItemClick(item.id, item.hasDropdown)}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className={cn("h-4 w-4 flex-shrink-0", !isActive && item.color)} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.hasDropdown && (
                        <div className="transition-transform duration-200">
                          {isDropdownOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      )}
                      {'badge' in item && item.badge ? (
                        <Badge variant="secondary" className="text-xs animate-pulse">
                          {(item as any).badge}
                        </Badge>
                      ) : null}
                    </>
                  )}
                </Button>
                
                {/* Dropdown submenu with smooth animation */}
                {item.hasDropdown && !isCollapsed && (
                  <div 
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isDropdownOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="ml-6 mt-2 space-y-1 pb-2">
                      {item.subItems?.map((subItem, index) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = activeTab === subItem.id;
                        
                        return (
                          <Button
                            key={subItem.id}
                            variant={isSubActive ? "default" : "ghost"}
                            className={cn(
                              "w-full justify-start gap-3 h-9 text-sm transition-all duration-200 hover-elevate",
                              isSubActive && "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm",
                              !isSubActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              "transform",
                              isDropdownOpen ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
                            )}
                            style={{
                              transitionDelay: isDropdownOpen ? `${index * 50}ms` : "0ms"
                            }}
                            onClick={() => onTabChange?.(subItem.id)}
                            data-testid={`nav-${subItem.id}`}
                          >
                            <SubIcon className="h-3 w-3 flex-shrink-0" />
                            <span className="flex-1 text-left">{subItem.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="mt-8 p-3 bg-card rounded-md border border-card-border hover-elevate transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-medium text-card-foreground">
                Quick Stats
              </h4>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3 text-blue-500" />
                  <span className="text-muted-foreground">Active Lots:</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {quickStats.activeLots}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-green-500" />
                  <span className="text-muted-foreground">Revenue:</span>
                </div>
                <span className="font-medium text-primary">
                  ₹{quickStats.todayRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span className="text-muted-foreground">Pending Bills:</span>
                </div>
                <Badge variant={quickStats.pendingBills > 0 ? "destructive" : "secondary"} className="text-xs">
                  {quickStats.pendingBills}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-purple-500" />
                  <span className="text-muted-foreground">Accounts:</span>
                </div>
                <span className="font-medium">{quickStats.totalAccounts}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3 text-indigo-500" />
                  <span className="text-muted-foreground">Products:</span>
                </div>
                <span className="font-medium">{quickStats.totalProducts}</span>
              </div>
            </div>
            
            {quickStats.pendingBills > 0 && (
              <div className="mt-3 p-2 bg-destructive/10 rounded-md border border-destructive/20">
                <div className="flex items-center gap-2">
                  <Bell className="h-3 w-3 text-destructive" />
                  <span className="text-xs text-destructive font-medium">
                    {quickStats.pendingBills} bills need attention
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}