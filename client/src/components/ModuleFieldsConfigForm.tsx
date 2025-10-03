import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useGlobalState } from "@/lib/globalState";
import type { InsertModuleSettings, ModuleSettings } from "@shared/schema";
import { insertModuleSettingsSchema } from "@shared/schema";
import { Loader2, Plus, Trash2, Settings2 } from "lucide-react";
import { useState } from "react";

// Define standard fields for each module type
const MODULE_STANDARD_FIELDS: Record<string, Record<string, string>> = {
  "account_master": {
    "accountType": "Account Type",
    "accountName": "Account Name",
    "place": "Place",
    "phoneNumber": "Phone Number",
    "alternatePhone": "Alternate Phone",
    "email": "Email",
    "address": "Address",
    "openingBalance": "Opening Balance",
    "creditLimit": "Credit Limit",
    "bankDetails": "Bank Details",
    "gstNumber": "GST Number",
    "panNumber": "PAN Number",
  },
  "product_master": {
    "productName": "Product Name",
    "variety": "Variety",
    "unit": "Unit",
    "hsnCode": "HSN Code",
    "taxRate": "Tax Rate",
    "standardRate": "Standard Rate",
    "minimumRate": "Minimum Rate",
    "maximumRate": "Maximum Rate",
    "description": "Description",
  },
  "place_master": {
    "placeName": "Place Name",
    "placeType": "Place Type",
    "district": "District",
    "state": "State",
    "pincode": "Pincode",
    "description": "Description",
  },
  "lot_entry": {
    "lotId": "Lot ID",
    "product": "Product",
    "quantity": "Quantity",
    "farmer": "Farmer",
    "agent": "Agent",
    "place": "Place",
    "arrivalDate": "Arrival Date",
    "vehicleNumber": "Vehicle Number",
    "transportName": "Transport Name",
    "qualityGrade": "Quality Grade",
    "moistureContent": "Moisture Content",
    "remarks": "Remarks",
  },
  "customer_billing": {
    "billNumber": "Bill Number",
    "billDate": "Bill Date",
    "customer": "Customer",
    "product": "Product",
    "quantity": "Quantity",
    "rate": "Rate",
    "amount": "Amount",
    "taxAmount": "Tax Amount",
    "discount": "Discount",
    "totalAmount": "Total Amount",
    "paymentMode": "Payment Mode",
    "remarks": "Remarks",
  },
  "customer_payment": {
    "receiptNumber": "Receipt Number",
    "receiptDate": "Receipt Date",
    "customer": "Customer",
    "paymentMode": "Payment Mode",
    "amount": "Amount",
    "referenceNumber": "Reference Number",
    "bankName": "Bank Name",
    "remarks": "Remarks",
  },
  "uplag_ledger": {
    "date": "Date",
    "customer": "Customer",
    "billAmount": "Bill Amount",
    "paymentAmount": "Payment Amount",
    "balance": "Balance",
    "remarks": "Remarks",
  },
  "khata_ledger": {
    "date": "Date",
    "farmerTransport": "Farmer/Transport",
    "debitAmount": "Debit Amount",
    "creditAmount": "Credit Amount",
    "balance": "Balance",
    "remarks": "Remarks",
  },
  "income_ledger": {
    "date": "Date",
    "incomeType": "Income Type",
    "amount": "Amount",
    "paymentMode": "Payment Mode",
    "description": "Description",
  },
  "expense_ledger": {
    "date": "Date",
    "expenseType": "Expense Type",
    "amount": "Amount",
    "paymentMode": "Payment Mode",
    "description": "Description",
  },
};

const AVAILABLE_MODULES = [
  { id: "account_master", name: "Account Master" },
  { id: "product_master", name: "Product Master" },
  { id: "place_master", name: "Place Master" },
  { id: "lot_entry", name: "Lot Entry" },
  { id: "customer_billing", name: "Customer Billing" },
  { id: "customer_payment", name: "Customer Payment Receipt" },
  { id: "uplag_ledger", name: "Uplag Ledger" },
  { id: "khata_ledger", name: "Khata Ledger" },
  { id: "income_ledger", name: "Income Ledger" },
  { id: "expense_ledger", name: "Expense Ledger" },
];

interface CustomField {
  name: string;
  type: "text" | "number" | "date" | "boolean" | "select" | "textarea";
  label: string;
  required: boolean;
  options?: string[];
}

export function ModuleFieldsConfigForm() {
  const { currentFY } = useGlobalState();
  const { toast } = useToast();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['/api/module-settings', currentFY],
    queryFn: async () => {
      const response = await fetch(`/api/module-settings?fy=${currentFY}`);
      if (!response.ok) throw new Error('Failed to fetch module settings');
      return response.json() as Promise<ModuleSettings[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertModuleSettings) => {
      return await apiRequest('POST', '/api/module-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/module-settings'] });
      toast({
        title: "Success",
        description: "Module settings saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ModuleSettings> }) => {
      return await apiRequest('PATCH', `/api/module-settings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/module-settings'] });
      toast({
        title: "Success",
        description: "Module settings updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/module-settings/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/module-settings'] });
      toast({
        title: "Success",
        description: "Module settings deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Module Field Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure fields for each module - turn off fields, add custom fields, and set requirements
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {settings.map((setting) => (
          <ModuleConfigCard
            key={setting.id}
            setting={setting}
            onUpdate={(data) => updateMutation.mutate({ id: setting.id, data })}
            onDelete={() => deleteMutation.mutate(setting.id)}
            isPending={updateMutation.isPending || deleteMutation.isPending}
          />
        ))}

        <NewModuleConfigForm
          existingModules={settings.map(s => s.moduleName)}
          onSubmit={(data) => createMutation.mutate(data)}
          isPending={createMutation.isPending}
        />
      </div>
    </div>
  );
}

function ModuleConfigCard({
  setting,
  onUpdate,
  onDelete,
  isPending,
}: {
  setting: ModuleSettings;
  onUpdate: (data: Partial<ModuleSettings>) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const [standardFields, setStandardFields] = useState<Record<string, { enabled: boolean; required: boolean; label: string }>>(
    (setting.fieldConfig as any)?.standardFields || {}
  );
  const [customFields, setCustomFields] = useState<CustomField[]>(
    (setting.fieldConfig as any)?.customFields || []
  );
  const [enableAutoSave, setEnableAutoSave] = useState(setting.enableAutoSave || false);
  const [enableValidation, setEnableValidation] = useState(setting.enableValidation ?? true);
  const [enableAuditLog, setEnableAuditLog] = useState(setting.enableAuditLog ?? true);

  const handleSave = () => {
    onUpdate({
      fieldConfig: {
        standardFields,
        customFields,
      },
      enableAutoSave,
      enableValidation,
      enableAuditLog,
    });
  };

  const handleToggleField = (fieldName: string, enabled: boolean) => {
    setStandardFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        enabled,
        label: prev[fieldName]?.label || MODULE_STANDARD_FIELDS[setting.moduleName]?.[fieldName] || fieldName,
      }
    }));
  };

  const handleToggleRequired = (fieldName: string, required: boolean) => {
    setStandardFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        required,
        label: prev[fieldName]?.label || MODULE_STANDARD_FIELDS[setting.moduleName]?.[fieldName] || fieldName,
      }
    }));
  };

  const handleAddCustomField = () => {
    setCustomFields(prev => [...prev, {
      name: "",
      type: "text",
      label: "",
      required: false,
    }]);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateCustomField = (index: number, field: Partial<CustomField>) => {
    setCustomFields(prev => prev.map((f, i) => i === index ? { ...f, ...field } : f));
  };

  const standardFieldsList = MODULE_STANDARD_FIELDS[setting.moduleName] || {};

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 gap-2">
        <div>
          <CardTitle>{setting.displayName}</CardTitle>
          <CardDescription>Module: {setting.moduleName}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            data-testid={`button-save-${setting.id}`}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            disabled={isPending}
            data-testid={`button-delete-${setting.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Module Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Module Settings</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor={`auto-save-${setting.id}`}>Auto Save</Label>
              <Switch
                id={`auto-save-${setting.id}`}
                checked={enableAutoSave}
                onCheckedChange={setEnableAutoSave}
                data-testid={`switch-autoSave-${setting.id}`}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor={`validation-${setting.id}`}>Enable Validation</Label>
              <Switch
                id={`validation-${setting.id}`}
                checked={enableValidation}
                onCheckedChange={setEnableValidation}
                data-testid={`switch-validation-${setting.id}`}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor={`audit-${setting.id}`}>Audit Log</Label>
              <Switch
                id={`audit-${setting.id}`}
                checked={enableAuditLog}
                onCheckedChange={setEnableAuditLog}
                data-testid={`switch-auditLog-${setting.id}`}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Standard Fields Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium">Standard Fields</h4>
          <div className="space-y-2">
            {Object.entries(standardFieldsList).map(([fieldName, fieldLabel]) => {
              const fieldConfig = standardFields[fieldName] || { enabled: true, required: false, label: fieldLabel };
              
              return (
                <div key={fieldName} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex-1">
                    <Label>{fieldLabel}</Label>
                    <p className="text-xs text-muted-foreground">{fieldName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Required</Label>
                      <Switch
                        checked={fieldConfig.required}
                        onCheckedChange={(checked) => handleToggleRequired(fieldName, checked)}
                        disabled={!fieldConfig.enabled}
                        data-testid={`switch-required-${fieldName}-${setting.id}`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Enabled</Label>
                      <Switch
                        checked={fieldConfig.enabled}
                        onCheckedChange={(checked) => handleToggleField(fieldName, checked)}
                        data-testid={`switch-enabled-${fieldName}-${setting.id}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Custom Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Custom Fields</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddCustomField}
              data-testid={`button-add-custom-field-${setting.id}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Field
            </Button>
          </div>

          <div className="space-y-4">
            {customFields.map((field, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-sm">Custom Field {index + 1}</h5>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveCustomField(index)}
                    data-testid={`button-remove-custom-field-${index}-${setting.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Field Name</Label>
                    <Input
                      value={field.name}
                      onChange={(e) => handleUpdateCustomField(index, { name: e.target.value })}
                      placeholder="e.g., customField1"
                      data-testid={`input-custom-field-name-${index}-${setting.id}`}
                    />
                  </div>

                  <div>
                    <Label>Field Label</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => handleUpdateCustomField(index, { label: e.target.value })}
                      placeholder="e.g., Custom Field"
                      data-testid={`input-custom-field-label-${index}-${setting.id}`}
                    />
                  </div>

                  <div>
                    <Label>Field Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value: any) => handleUpdateCustomField(index, { type: value })}
                    >
                      <SelectTrigger data-testid={`select-custom-field-type-${index}-${setting.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="select">Select (Dropdown)</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label>Required Field</Label>
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => handleUpdateCustomField(index, { required: checked })}
                      data-testid={`switch-custom-field-required-${index}-${setting.id}`}
                    />
                  </div>
                </div>

                {field.type === "select" && (
                  <div>
                    <Label>Options (comma-separated)</Label>
                    <Input
                      value={field.options?.join(", ") || ""}
                      onChange={(e) => handleUpdateCustomField(index, {
                        options: e.target.value.split(",").map(o => o.trim()).filter(Boolean)
                      })}
                      placeholder="e.g., Option 1, Option 2, Option 3"
                      data-testid={`input-custom-field-options-${index}-${setting.id}`}
                    />
                  </div>
                )}
              </div>
            ))}

            {customFields.length === 0 && (
              <div className="text-center text-muted-foreground py-8 border rounded-lg">
                No custom fields added. Click "Add Custom Field" to create one.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NewModuleConfigForm({
  existingModules,
  onSubmit,
  isPending,
}: {
  existingModules: string[];
  onSubmit: (data: InsertModuleSettings) => void;
  isPending: boolean;
}) {
  const { currentFY } = useGlobalState();
  const [selectedModule, setSelectedModule] = useState<string>("");

  const form = useForm<InsertModuleSettings>({
    resolver: zodResolver(insertModuleSettingsSchema),
    defaultValues: {
      financialYear: currentFY,
      moduleName: "",
      displayName: "",
      fieldConfig: {
        standardFields: {},
        customFields: []
      },
      enableAutoSave: false,
      enableValidation: true,
      enableAuditLog: true,
      isActive: true,
    },
  });

  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
    const module = AVAILABLE_MODULES.find(m => m.id === moduleId);
    if (module) {
      form.setValue("moduleName", module.id);
      form.setValue("displayName", module.name);

      // Initialize standard fields for the selected module
      const standardFields: Record<string, { enabled: boolean; required: boolean; label: string }> = {};
      const moduleFields = MODULE_STANDARD_FIELDS[moduleId] || {};
      
      Object.entries(moduleFields).forEach(([fieldName, fieldLabel]) => {
        standardFields[fieldName] = {
          enabled: true,
          required: false,
          label: fieldLabel,
        };
      });

      form.setValue("fieldConfig", {
        standardFields,
        customFields: []
      });
    }
  };

  const availableModules = AVAILABLE_MODULES.filter(m => !existingModules.includes(m.id));

  if (availableModules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Modules Configured</CardTitle>
          <CardDescription>
            All available modules have been configured. You can edit existing configurations above.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Configure New Module
        </CardTitle>
        <CardDescription>
          Select a module to configure its fields and settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="moduleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Module</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleModuleSelect(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-new-module">
                        <SelectValue placeholder="Choose a module to configure" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableModules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select which module you want to configure field settings for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedModule && (
              <div className="text-sm text-muted-foreground">
                <p>After creating this configuration, you can customize fields, add custom fields, and adjust settings in the card above.</p>
              </div>
            )}

            <Button type="submit" disabled={isPending || !selectedModule} data-testid="button-create-module-config">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Module Configuration"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
