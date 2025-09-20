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

interface LotFormProps {
  onSubmit?: (lotData: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

// todo: remove mock functionality
const mockProducts = [
  "Onion", "Wheat", "Rice", "Potato", "Tomato", "Cotton", "Sugarcane"
];

const mockFarmers = [
  { id: "F-RK-001", name: "Rajesh Kumar" },
  { id: "F-SP-002", name: "Suresh Patel" },
  { id: "F-AS-003", name: "Amit Singh" },
];

export default function LotForm({ onSubmit, onCancel, initialData }: LotFormProps) {
  const [formData, setFormData] = useState({
    product: initialData?.product || "",
    totalQuantity: initialData?.totalQuantity || "",
    farmerId: initialData?.farmerId || "",
    farmerQuantity: initialData?.farmerQuantity || "",
    quality: initialData?.quality || "",
    basePrice: initialData?.basePrice || "",
    description: initialData?.description || "",
    customFields: initialData?.customFields || []
  });

  const [newField, setNewField] = useState({ name: "", value: "" });

  const generateLotId = () => {
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `${formData.product}-${formData.totalQuantity}-${formData.farmerQuantity}-${seq}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lotData = {
      ...formData,
      id: generateLotId(),
      createdAt: new Date().toISOString(),
      status: "active"
    };
    console.log("Lot submitted:", lotData);
    onSubmit?.(lotData);
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

  const previewLotId = formData.product && formData.totalQuantity && formData.farmerQuantity 
    ? generateLotId() 
    : "---";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New Lot</CardTitle>
            <Badge variant="outline" className="font-mono">
              ID: {previewLotId}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product */}
              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select value={formData.product} onValueChange={(value) => setFormData(prev => ({ ...prev, product: value }))}>
                  <SelectTrigger data-testid="select-product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map(product => (
                      <SelectItem key={product} value={product}>{product}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Total Quantity */}
              <div className="space-y-2">
                <Label htmlFor="totalQuantity">Total Quantity (quintals) *</Label>
                <Input
                  id="totalQuantity"
                  type="number"
                  value={formData.totalQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalQuantity: e.target.value }))}
                  placeholder="Enter total quantity"
                  data-testid="input-total-quantity"
                  required
                />
              </div>

              {/* Farmer */}
              <div className="space-y-2">
                <Label htmlFor="farmer">Farmer/Agent *</Label>
                <Select value={formData.farmerId} onValueChange={(value) => setFormData(prev => ({ ...prev, farmerId: value }))}>
                  <SelectTrigger data-testid="select-farmer">
                    <SelectValue placeholder="Select farmer/agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockFarmers.map(farmer => (
                      <SelectItem key={farmer.id} value={farmer.id}>
                        {farmer.name} ({farmer.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Farmer Quantity */}
              <div className="space-y-2">
                <Label htmlFor="farmerQuantity">Farmer Items Quantity (quintals) *</Label>
                <Input
                  id="farmerQuantity"
                  type="number"
                  value={formData.farmerQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, farmerQuantity: e.target.value }))}
                  placeholder="Enter farmer quantity"
                  data-testid="input-farmer-quantity"
                  required
                />
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <Label htmlFor="quality">Quality Grade</Label>
                <Select value={formData.quality} onValueChange={(value) => setFormData(prev => ({ ...prev, quality: value }))}>
                  <SelectTrigger data-testid="select-quality">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grade A - Premium</SelectItem>
                    <SelectItem value="B">Grade B - Good</SelectItem>
                    <SelectItem value="C">Grade C - Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Base Price */}
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (₹ per quintal)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                  placeholder="Enter base price"
                  data-testid="input-base-price"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter lot description, notes, or special conditions..."
                rows={3}
                data-testid="textarea-description"
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
                Create Lot
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}