import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, MapPin, Phone, DollarSign, Package, Building2, CreditCard, Receipt } from "lucide-react";
import { format } from "date-fns";

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  itemType: "account" | "product" | "place" | "expense" | "billing" | "receipt";
}

export default function ViewDetailsModal({ isOpen, onClose, item, itemType }: ViewDetailsModalProps) {
  if (!item) return null;

  const getModalTitle = () => {
    switch (itemType) {
      case "account": return "Account Details";
      case "product": return "Product Details";  
      case "place": return "Place Details";
      case "expense": return "Expense Details";
      case "billing": return "Bill Details";
      case "receipt": return "Receipt Details";
      default: return "Item Details";
    }
  };

  const getModalIcon = () => {
    switch (itemType) {
      case "account": return <Building2 className="h-5 w-5" />;
      case "product": return <Package className="h-5 w-5" />;
      case "place": return <MapPin className="h-5 w-5" />;
      case "expense": return <CreditCard className="h-5 w-5" />;
      case "billing": return <DollarSign className="h-5 w-5" />;
      case "receipt": return <Receipt className="h-5 w-5" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString()}`;
  };

  const renderAccountDetails = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{item.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account ID</label>
              <p className="font-mono">{item.accountId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <Badge variant={item.type === "Buyer" ? "default" : "outline"}>{item.type}</Badge>
            </div>
          </div>
          
          {item.mobile && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{item.mobile}</span>
            </div>
          )}
          
          {item.address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <span>{item.address}</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Opening Balance</label>
              <p className="font-semibold text-green-600">{formatCurrency(item.openingBalance || 0)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Credit Limit</label>
              <p className="font-semibold">{formatCurrency(item.creditLimit || 0)}</p>
            </div>
          </div>
          
          {item.remarks && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Remarks</label>
              <p className="text-sm">{item.remarks}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderProductDetails = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{item.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Product ID</label>
              <p className="font-mono">{item.productId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Unit</label>
              <Badge variant="outline">{item.unit}</Badge>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Badge variant={item.active ? "default" : "destructive"}>
              {item.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Financial Year</label>
            <p>{item.financialYear}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPlaceDetails = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{item.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Place ID</label>
            <p className="font-mono">{item.placeId}</p>
          </div>
          
          {item.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p>{item.description}</p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Badge variant={item.active ? "default" : "destructive"}>
              {item.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Financial Year</label>
            <p>{item.financialYear}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExpenseDetails = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{item.expenseName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Product ID</label>
              <p className="font-mono">{item.productId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Linked To</label>
              <Badge variant={item.linkedTo === "Buyer" ? "default" : "outline"}>
                {item.linkedTo}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expense Type</label>
              <Badge variant="secondary">{item.expenseType}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Value</label>
              <p className="font-semibold text-green-600">{formatCurrency(item.value || 0)}</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Badge variant={item.active ? "default" : "destructive"}>
              {item.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBillingDetails = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bill #{item.billNo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Customer</label>
              <p className="font-semibold">{item.customerName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Bill Date</label>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(item.billDate)}</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
              <p className="font-semibold text-lg">{formatCurrency(item.totalAmount || 0)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Net Amount</label>
              <p className="font-semibold text-lg text-green-600">{formatCurrency(item.netAmount || 0)}</p>
            </div>
          </div>
          
          {item.commission && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Commission</label>
              <p>{formatCurrency(item.commission)}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Mode</label>
              <Badge variant="outline">{item.paymentMode}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Balance</label>
              <p className={`font-semibold ${item.balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(item.balanceAmount || 0)}
              </p>
            </div>
          </div>
          
          {item.notes && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <p className="text-sm">{item.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderReceiptDetails = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Receipt #{item.receiptNo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Party Name</label>
              <p className="font-semibold">{item.customerName || item.partyName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Receipt Date</label>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(item.receiptDate)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Type</label>
            <Badge variant="outline">
              {item.customerName ? "Customer" : "Other"}
            </Badge>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <p className="font-semibold text-lg text-green-600">
                {formatCurrency(item.amount || item.netAmount || 0)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Payment Mode</label>
              <Badge variant="outline">{item.paymentMode}</Badge>
            </div>
          </div>
          
          {item.notes && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <p className="text-sm">{item.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (itemType) {
      case "account": return renderAccountDetails();
      case "product": return renderProductDetails();
      case "place": return renderPlaceDetails(); 
      case "expense": return renderExpenseDetails();
      case "billing": return renderBillingDetails();
      case "receipt": return renderReceiptDetails();
      default: return <p>Item details not available</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-view-details">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getModalIcon()}
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            View complete details and information
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}