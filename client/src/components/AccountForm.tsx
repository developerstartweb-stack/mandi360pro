import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface AccountFormProps {
  onSubmit?: (accountData: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

const accountTypes = [
  { value: "B", label: "Buyer", description: "Purchases products from mandi" },
  { value: "S", label: "Seller", description: "Sells products through mandi" },
  { value: "F", label: "Farmer", description: "Produces and supplies products" },
  { value: "A", label: "Agent", description: "Commission agent/broker" },
  { value: "T", label: "Transport", description: "Transportation and logistics services" },
];

export default function AccountForm({ onSubmit, onCancel, initialData }: AccountFormProps) {
  const [formData, setFormData] = useState({
    type: initialData?.type || "",
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    gstNumber: initialData?.gstNumber || "",
    panNumber: initialData?.panNumber || "",
    customFields: initialData?.customFields || []
  });

  const [newField, setNewField] = useState({ name: "", value: "" });

  const generateAccountId = () => {
    if (!formData.type || !formData.name) return "---";
    
    const initials = formData.name
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
    
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `${formData.type}-${initials}-${seq}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const accountData = {
      ...formData,
      id: generateAccountId(),
      createdAt: new Date().toISOString(),
      status: "active"
    };
    console.log("Account submitted:", accountData);
    onSubmit?.(accountData);
  };

  const addCustomField = () => {
    if (newField.name && newField.value) {
      setFormData(prev => ({
        ...prev,
        customFields: [...prev.customFields, { ...newField, id: Date.now() }]
      }));
      setNewField({ name: "", value: "" });
    }
  };

  const removeCustomField = (id: number) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((field: any) => field.id !== id)
    }));
  };

  const selectedType = accountTypes.find(type => type.value === formData.type);
  const previewAccountId = generateAccountId();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New Account</CardTitle>
            <Badge variant="outline" className="font-mono">
              ID: {previewAccountId}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Type */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="type">Account Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger data-testid="select-account-type">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{type.label}</span>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedType && (
                  <p className="text-sm text-muted-foreground">{selectedType.description}</p>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  data-testid="input-name"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  data-testid="input-phone"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  data-testid="input-email"
                />
              </div>

              {/* GST Number */}
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
                  placeholder="Enter GST number"
                  data-testid="input-gst"
                />
              </div>

              {/* PAN Number */}
              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  value={formData.panNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value }))}
                  placeholder="Enter PAN number"
                  data-testid="input-pan"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter complete address..."
                rows={3}
                data-testid="textarea-address"
              />
            </div>

            {/* Custom Fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Custom Fields</Label>
                <Badge variant="secondary" className="text-xs">
                  {formData.customFields.length} fields
                </Badge>
              </div>
              
              {formData.customFields.length > 0 && (
                <div className="space-y-2">
                  {formData.customFields.map((field: any) => (
                    <div key={field.id} className="flex items-center gap-2 p-2 border rounded-md">
                      <span className="font-medium text-sm">{field.name}:</span>
                      <span className="text-sm">{field.value}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={() => removeCustomField(field.id)}
                        data-testid={`button-remove-field-${field.id}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  placeholder="Field name"
                  value={newField.name}
                  onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                  data-testid="input-field-name"
                />
                <Input
                  placeholder="Field value"
                  value={newField.value}
                  onChange={(e) => setNewField(prev => ({ ...prev, value: e.target.value }))}
                  data-testid="input-field-value"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomField}
                  data-testid="button-add-field"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                data-testid="button-submit"
              >
                Create Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}