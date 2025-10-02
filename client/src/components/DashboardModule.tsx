import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  Activity,
  Bell
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Data interfaces
interface ProductQuantity {
  [product: string]: number;
}

interface ReminderAlert {
  Message: string;
  Date: string;
}

interface RecentActivityItem {
  Activity: string;
  Timestamp: string;
}

interface DashboardData {
  id: string;
  fy: string;
  TodayArrivals: ProductQuantity;
  TodaySales: ProductQuantity;
  PendingStock: ProductQuantity;
  PendingBalance: number;
  PendingKhata: number;
  ReminderAlerts: ReminderAlert[];
  QuickActions: string[];
  RecentActivity: RecentActivityItem[];
  createdAt: string;
  updatedAt: string;
}

interface DashboardModuleProps {
  currentFY: string;
  onFYChange: (fy: string) => void;
}

// Default dashboard data generator
const getDefaultDashboardData = (fy: string = "2025-26"): DashboardData => {
  const baseData = {
    TodayArrivals: { Onion: 250, Potato: 500, Garlic: 70 },
    TodaySales: { Onion: 180, Potato: 300, Garlic: 45 },
    PendingBalance: 25000,
    PendingKhata: 15000,
    ReminderAlerts: [
      { Message: "Suraj Varma ₹2000 overdue", Date: "2025-09-21" },
      { Message: "Check Potato quality", Date: "2025-09-22" },
      { Message: "Update price list", Date: "2025-09-23" }
    ],
    QuickActions: [
      "Add New Lot", "Create Bill", "Send Invoice", 
      "Update Prices", "Check Stock", "View Reports"
    ],
    RecentActivity: [
      { Activity: "Sold 150 Onion to Ramesh Traders", Timestamp: "2025-09-21 07:00" },
      { Activity: "Received 200 Potato from Suresh Farm", Timestamp: "2025-09-21 06:30" },
      { Activity: "Updated Garlic price to ₹80/kg", Timestamp: "2025-09-21 06:00" }
    ]
  };

  // Auto-calculate pending stock
  const PendingStock: ProductQuantity = {};
  Object.keys(baseData.TodayArrivals).forEach(product => {
    const arrivals = baseData.TodayArrivals[product] || 0;
    const sales = baseData.TodaySales[product] || 0;
    PendingStock[product] = arrivals - sales;
  });

  return {
    id: `dashboard-${fy}`,
    fy,
    ...baseData,
    PendingStock,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export default function DashboardModule({ currentFY, onFYChange }: DashboardModuleProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Load dashboard data on mount and FY change
  useEffect(() => {
    const loadDashboardData = () => {
      try {
        const savedData = localStorage.getItem(`dashboard-data-${currentFY}`);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setDashboardData(parsed);
        } else {
          // Generate and save default data for this FY
          const defaultData = getDefaultDashboardData(currentFY);
          setDashboardData(defaultData);
          localStorage.setItem(`dashboard-data-${currentFY}`, JSON.stringify(defaultData));
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        const defaultData = getDefaultDashboardData(currentFY);
        setDashboardData(defaultData);
      }
    };

    loadDashboardData();
  }, [currentFY]);

  const convertToChartData = (data: ProductQuantity) => {
    return Object.entries(data).map(([product, quantity]) => ({
      product,
      quantity
    }));
  };

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading Dashboard...</div>
      </div>
    );
  }

  const overdueAlerts = dashboardData.ReminderAlerts.filter(alert => 
    new Date(alert.Date) <= new Date()
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard Module</h1>
          <p className="text-muted-foreground">
            Live Data from Mandi360pro
          </p>
        </div>
      </div>

      {/* Dashboard Cards Grid - 2x4 Layout with 300px cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
        
        {/* Today's Arrivals Card */}
        <Card
          className="w-[300px] h-[250px] border-2"
          style={{ borderColor: '#90EE90' }}
          data-testid="card-todays-arrivals"
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Today's Arrivals
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={convertToChartData(dashboardData.TodayArrivals)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#90EE90" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today's Sales Card */}
        <Card
          className="w-[300px] h-[250px] border-2"
          style={{ borderColor: '#90EE90' }}
          data-testid="card-todays-sales"
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Today's Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={convertToChartData(dashboardData.TodaySales)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#FF6B6B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pending Stock Card */}
        <Card
          className="w-[300px] h-[250px] border-2"
          style={{ borderColor: '#90EE90' }}
          data-testid="card-pending-stock"
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package className="h-4 w-4" />
              Pending Stock (Auto-calculated)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[180px] overflow-auto">
            <div className="space-y-2">
              {Object.entries(dashboardData.PendingStock).map(([product, quantity]) => (
                <div key={product} className="flex justify-between items-center p-2 bg-secondary/20 rounded-md">
                  <span className="text-sm font-medium">{product}</span>
                  <Badge variant={quantity > 0 ? "default" : "destructive"} className="text-xs">
                    {quantity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Balance Card */}
        <Card
          className="w-[300px] h-[250px] border-2"
          style={{ borderColor: '#90EE90' }}
          data-testid="card-pending-balance"
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Pending Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[180px]">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  ₹{(dashboardData.PendingBalance + dashboardData.PendingKhata).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Outstanding</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                  <span className="text-sm">Cash/Balance</span>
                  <span className="text-sm font-medium">₹{dashboardData.PendingBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-950 rounded-md">
                  <span className="text-sm">Khata</span>
                  <span className="text-sm font-medium">₹{dashboardData.PendingKhata.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminder Alerts Card */}
        <Card
          className="w-[300px] h-[250px] border-2"
          style={{ borderColor: '#90EE90' }}
          data-testid="card-reminder-alerts"
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Bell className="h-4 w-4" />
              Reminder Alerts
              {overdueAlerts.length > 0 && (
                <Badge variant="destructive" className="text-xs ml-2">
                  {overdueAlerts.length} overdue
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[180px] overflow-auto">
            <div className="space-y-2">
              {dashboardData.ReminderAlerts.map((alert, index) => {
                const isOverdue = new Date(alert.Date) <= new Date();
                return (
                  <div key={index} className={`p-2 rounded-md border-l-4 ${
                    isOverdue ? 'bg-destructive/10 border-destructive' : 'bg-secondary/20 border-primary'
                  }`}>
                    <div className="text-sm font-medium">{alert.Message}</div>
                    <div className="text-xs text-muted-foreground">Due: {alert.Date}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card
          className="w-[300px] h-[250px] border-2"
          style={{ borderColor: '#90EE90', backgroundColor: '#90EE90', backgroundImage: 'linear-gradient(rgba(144, 238, 144, 0.1), rgba(144, 238, 144, 0.1))' }}
          data-testid="card-quick-actions"
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[180px]">
            <div className="grid grid-cols-2 gap-2">
              {dashboardData.QuickActions.map((action, index) => (
                <div
                  key={index}
                  className="text-xs h-8 bg-white/80 p-2 rounded border flex items-center justify-center text-center"
                  data-testid={`quick-action-${index}`}
                >
                  {action}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card
          className="w-[300px] h-[250px] border-2"
          style={{ borderColor: '#90EE90' }}
          data-testid="card-recent-activity"
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[180px] overflow-auto">
            <div className="space-y-2">
              {dashboardData.RecentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="p-2 bg-secondary/20 rounded-md animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-sm font-medium">{activity.Activity}</div>
                  <div className="text-xs text-muted-foreground">{activity.Timestamp}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}