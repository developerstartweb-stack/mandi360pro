import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGlobalState } from "@/lib/globalState";
import { useState } from "react";

interface HeaderProps {
  onMenuClick?: () => void;
  currentFY: string;
  onFYChange: (fy: string) => void;
}

export default function Header({ onMenuClick, currentFY, onFYChange }: HeaderProps) {
  // Safely access global state with fallback
  let companyName = "Mandi360pro"; // Default fallback
  try {
    const { state } = useGlobalState();
    companyName = state.companyProfile?.companyName || "Mandi360pro";
  } catch (error) {
    // Global state not available yet, use default
    console.log("Global state not yet available, using default company name");
  }

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          data-testid="button-menu"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-display font-semibold text-primary">
            {companyName}
          </h1>
          <Badge variant="secondary" className="text-xs">
            v1.0
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">

        {/* FY Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">FY:</span>
          <Select value={currentFY} onValueChange={onFYChange}>
            <SelectTrigger className="w-28" data-testid="select-fy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-25">2024-25</SelectItem>
              <SelectItem value="2025-26">2025-26</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reminders & Notifications Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-reminders-notifications"
          onClick={() => console.log("Reminders and notifications clicked")}
        >
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-destructive">
            5
          </Badge>
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              OM
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">Owner</p>
            <p className="text-xs text-muted-foreground">Mandi Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}