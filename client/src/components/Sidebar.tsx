import { 
  Home, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Settings,
  TrendingUp,
  Building,
  Database
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
  { id: "accounts", label: "Accounts", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "master-data", label: "Master Data", icon: Database },
  { id: "transactions", label: "Transactions", icon: ShoppingCart },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ activeTab = "dashboard", onTabChange, isCollapsed = false }: SidebarProps) {
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
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                  isCollapsed && "px-2"
                )}
                onClick={() => onTabChange?.(item.id)}
                data-testid={`nav-${item.id}`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
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