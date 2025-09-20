import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wheat, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DashboardProps {
  currentFY: string;
}

// todo: remove mock functionality
const mockData = {
  metrics: [
    { title: "Total Revenue", value: "₹12,45,000", change: "+12.5%", icon: DollarSign, trend: "up" },
    { title: "Active Lots", value: "12", change: "+3", icon: Wheat, trend: "up" },
    { title: "Registered Accounts", value: "145", change: "+8", icon: Users, trend: "up" },
    { title: "Products Listed", value: "28", change: "+2", icon: Package, trend: "up" },
  ],
  recentLots: [
    { id: "Onion-25-10-001", product: "Onion", quantity: "25 quintals", status: "active", farmer: "Rajesh Kumar", price: "₹2,500/qt" },
    { id: "Wheat-50-30-002", product: "Wheat", quantity: "50 quintals", status: "sold", farmer: "Suresh Patel", price: "₹2,200/qt" },
    { id: "Rice-40-25-003", product: "Rice", quantity: "40 quintals", status: "pending", farmer: "Amit Singh", price: "₹3,100/qt" },
  ],
  pendingActions: [
    { type: "payment", message: "Payment due from B-RK-001", priority: "high" },
    { type: "lot", message: "Lot quality inspection pending", priority: "medium" },
    { type: "account", message: "New seller verification required", priority: "low" },
  ]
};

export default function Dashboard({ currentFY }: DashboardProps) {
  const handleViewLot = (lotId: string) => {
    console.log("View lot:", lotId);
  };

  const handleEditLot = (lotId: string) => {
    console.log("Edit lot:", lotId);
  };

  const handleDeleteLot = (lotId: string) => {
    console.log("Delete lot:", lotId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Financial Year {currentFY} Overview</p>
        </div>
        <Button className="gap-2" data-testid="button-add-lot">
          <Plus className="h-4 w-4" />
          Add New Lot
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockData.metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-primary">{metric.change}</span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Lots */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wheat className="h-5 w-5 text-primary" />
              Recent Lots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentLots.map((lot, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-md hover-elevate">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{lot.id}</span>
                      <Badge 
                        variant={lot.status === 'active' ? 'default' : lot.status === 'sold' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {lot.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lot.product} • {lot.quantity} • {lot.farmer}
                    </p>
                    <p className="text-sm font-medium text-primary">{lot.price}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleViewLot(lot.id)}
                      data-testid={`button-view-${lot.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEditLot(lot.id)}
                      data-testid={`button-edit-${lot.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDeleteLot(lot.id)}
                      data-testid={`button-delete-${lot.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockData.pendingActions.map((action, index) => (
                <div key={index} className="p-3 border border-border rounded-md">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground flex-1">{action.message}</p>
                    <Badge 
                      variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {action.priority}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={() => console.log("Action resolved:", action.message)}
                    data-testid={`button-resolve-${index}`}
                  >
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Revenue Target</span>
                <span className="text-sm font-medium">₹12,45,000 / ₹15,00,000</span>
              </div>
              <Progress value={83} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Lots Processed</span>
                <span className="text-sm font-medium">47 / 60</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}