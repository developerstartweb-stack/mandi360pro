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
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isCollapsed?: boolean;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { 
    id: "master-data", 
    label: "Master Data", 
    icon: Database,
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
    hasDropdown: true,
    subItems: [
      { id: "lot-entry", label: "Lot Entry", icon: Plus },
      { id: "godown-awak", label: "Godown Awak", icon: Building },
      { id: "damage", label: "Damage", icon: AlertTriangle },
      { id: "weight-slip", label: "Weight Slip", icon: Scale }
    ]
  },
  { id: "bill-desk", label: "Bill Desk", icon: Receipt },
  { id: "farmer-invoice", label: "Farmer Invoice", icon: FileText },
  { id: "accounting", label: "Accounting", icon: DollarSign },
  { id: "ledger", label: "Ledger Module", icon: BookOpen },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ activeTab = "dashboard", onTabChange, isCollapsed = false }: SidebarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
              <div key={item.id}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                    isCollapsed && "px-2"
                  )}
                  onClick={() => handleItemClick(item.id, item.hasDropdown)}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.hasDropdown && (
                        isDropdownOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      )}
                      {'badge' in item && item.badge ? (
                        <Badge variant="secondary" className="text-xs">
                          {(item as any).badge}
                        </Badge>
                      ) : null}
                    </>
                  )}
                </Button>
                
                {/* Dropdown submenu */}
                {item.hasDropdown && isDropdownOpen && !isCollapsed && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.subItems?.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeTab === subItem.id;
                      
                      return (
                        <Button
                          key={subItem.id}
                          variant={isSubActive ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-3 h-9 text-sm",
                            isSubActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                          )}
                          onClick={() => onTabChange?.(subItem.id)}
                          data-testid={`nav-${subItem.id}`}
                        >
                          <SubIcon className="h-3 w-3 flex-shrink-0" />
                          <span className="flex-1 text-left">{subItem.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="mt-8 p-3 bg-card rounded-md border border-card-border">
            <h4 className="text-sm font-medium text-card-foreground mb-2">
              Quick Stats
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Lots:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today's Revenue:</span>
                <span className="font-medium text-primary">₹2,45,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending Bills:</span>
                <span className="font-medium text-destructive">5</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}