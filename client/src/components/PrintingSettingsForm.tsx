import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { InsertPrintingSettings, PrintingSettings } from "@shared/schema";
import { insertPrintingSettingsSchema } from "@shared/schema";
import { Loader2, Plus, Trash2 } from "lucide-react";

export function PrintingSettingsForm() {
  const { currentFY } = useGlobalState();
  const { toast } = useToast();

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['/api/printing-settings', currentFY],
    queryFn: async () => {
      const response = await fetch(`/api/printing-settings?fy=${currentFY}`);
      if (!response.ok) throw new Error('Failed to fetch printing settings');
      return response.json() as Promise<PrintingSettings[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertPrintingSettings) => {
      return await apiRequest('POST', '/api/printing-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/printing-settings'] });
      toast({
        title: "Success",
        description: "Print settings saved successfully",
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<PrintingSettings> }) => {
      return await apiRequest('PATCH', `/api/printing-settings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/printing-settings'] });
      toast({
        title: "Success",
        description: "Print settings updated successfully",
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
      return await apiRequest('DELETE', `/api/printing-settings/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/printing-settings'] });
      toast({
        title: "Success",
        description: "Print settings deleted successfully",
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
          <h3 className="text-lg font-medium">Print Settings</h3>
          <p className="text-sm text-muted-foreground">
            Customize print layouts for bills, receipts, and other documents
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {settings.map((setting) => (
          <PrintSettingCard
            key={setting.id}
            setting={setting}
            onUpdate={(data) => updateMutation.mutate({ id: setting.id, data })}
            onDelete={() => deleteMutation.mutate(setting.id)}
            isPending={updateMutation.isPending || deleteMutation.isPending}
          />
        ))}

        <NewPrintSettingForm
          onSubmit={(data) => createMutation.mutate(data)}
          isPending={createMutation.isPending}
        />
      </div>
    </div>
  );
}

function PrintSettingCard({
  setting,
  onUpdate,
  onDelete,
  isPending,
}: {
  setting: PrintingSettings;
  onUpdate: (data: Partial<PrintingSettings>) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const form = useForm<Partial<PrintingSettings>>({
    defaultValues: setting,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 gap-2">
        <div>
          <CardTitle>{setting.templateName}</CardTitle>
          <CardDescription>
            {setting.documentType} • {setting.paperSize} • {setting.orientation}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={form.handleSubmit((data) => onUpdate(data))}
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
        <Form {...form}>
          <PrintSettingsFields form={form} />
        </Form>
      </CardContent>
    </Card>
  );
}

function NewPrintSettingForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: InsertPrintingSettings) => void;
  isPending: boolean;
}) {
  const { currentFY } = useGlobalState();
  const form = useForm<InsertPrintingSettings>({
    resolver: zodResolver(insertPrintingSettingsSchema),
    defaultValues: {
      financialYear: currentFY,
      templateName: "",
      documentType: "bill",
      paperSize: "A4",
      orientation: "portrait",
      marginTop: "10",
      marginBottom: "10",
      marginLeft: "10",
      marginRight: "10",
      showHeader: true,
      showFooter: true,
      showLogo: true,
      showCompanyName: true,
      showCompanyAddress: true,
      showCompanyContact: true,
      showGst: true,
      showLicense: false,
      headerFontSize: 12,
      headerAlignment: "center",
      footerFontSize: 10,
      footerAlignment: "center",
      showRemark: true,
      showPageNumber: true,
      showPrintDate: true,
      showBorders: true,
      tableFontSize: 10,
      showSerialNumber: true,
      showProductCode: true,
      showQuantity: true,
      showRate: true,
      showAmount: true,
      showTax: true,
      showDiscount: false,
      copies: 1,
      colorPrint: false,
      showWatermark: false,
      fieldsToShow: [],
      isActive: true,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Print Template
        </CardTitle>
        <CardDescription>
          Configure a new print template for your documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PrintSettingsFields form={form} />
            <Button type="submit" disabled={isPending} data-testid="button-create-template">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function PrintSettingsFields({ form }: { form: any }) {
  const paperSize = form.watch("paperSize");

  return (
    <>
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-medium">Template Information</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="templateName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Standard Bill" data-testid="input-templateName" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-documentType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="bill">Bill</SelectItem>
                    <SelectItem value="receipt">Receipt</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Paper Size Settings */}
      <div className="space-y-4">
        <h4 className="font-medium">Paper Size & Orientation</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="paperSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paper Size</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-paperSize">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A4">A4 (210 x 297 mm)</SelectItem>
                    <SelectItem value="A5">A5 (148 x 210 mm)</SelectItem>
                    <SelectItem value="Letter">Letter (216 x 279 mm)</SelectItem>
                    <SelectItem value="Thermal-80mm">Thermal 80mm</SelectItem>
                    <SelectItem value="Thermal-58mm">Thermal 58mm</SelectItem>
                    <SelectItem value="Custom">Custom Size</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="orientation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orientation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-orientation">
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {paperSize === "Custom" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="customWidth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Width (mm)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="e.g., 210" data-testid="input-customWidth" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customHeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Height (mm)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="e.g., 297" data-testid="input-customHeight" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Margin Settings */}
      <div className="space-y-4">
        <h4 className="font-medium">Margins (mm)</h4>
        <div className="grid gap-4 sm:grid-cols-4">
          <FormField
            control={form.control}
            name="marginTop"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Top</FormLabel>
                <FormControl>
                  <Input {...field} type="number" data-testid="input-marginTop" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marginBottom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bottom</FormLabel>
                <FormControl>
                  <Input {...field} type="number" data-testid="input-marginBottom" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marginLeft"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Left</FormLabel>
                <FormControl>
                  <Input {...field} type="number" data-testid="input-marginLeft" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marginRight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Right</FormLabel>
                <FormControl>
                  <Input {...field} type="number" data-testid="input-marginRight" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Header Settings */}
      <div className="space-y-4">
        <h4 className="font-medium">Header Settings</h4>
        
        <FormField
          control={form.control}
          name="showHeader"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel>Show Header</FormLabel>
                <FormDescription>Display header section on printed documents</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-showHeader"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <FormField
            control={form.control}
            name="showLogo"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showLogo"
                  />
                </FormControl>
                <FormLabel>Show Logo</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showCompanyName"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showCompanyName"
                  />
                </FormControl>
                <FormLabel>Company Name</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showCompanyAddress"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showCompanyAddress"
                  />
                </FormControl>
                <FormLabel>Address</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showCompanyContact"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showCompanyContact"
                  />
                </FormControl>
                <FormLabel>Contact</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showGst"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showGst"
                  />
                </FormControl>
                <FormLabel>GST Number</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showLicense"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showLicense"
                  />
                </FormControl>
                <FormLabel>License Number</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="headerFontSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Header Font Size</FormLabel>
                <FormControl>
                  <Input {...field} type="number" data-testid="input-headerFontSize" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="headerAlignment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Header Alignment</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-headerAlignment">
                      <SelectValue placeholder="Select alignment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="headerTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Header Template</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter custom header text or HTML template (optional)"
                  rows={3}
                  data-testid="textarea-headerTemplate"
                />
              </FormControl>
              <FormDescription>
                Use variables like &#123;companyName&#125;, &#123;address&#125;, &#123;gst&#125;
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      {/* Footer Settings */}
      <div className="space-y-4">
        <h4 className="font-medium">Footer Settings</h4>
        
        <FormField
          control={form.control}
          name="showFooter"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel>Show Footer</FormLabel>
                <FormDescription>Display footer section on printed documents</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-showFooter"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="showRemark"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showRemark"
                  />
                </FormControl>
                <FormLabel>Show Remark</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showPageNumber"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showPageNumber"
                  />
                </FormControl>
                <FormLabel>Page Number</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showPrintDate"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showPrintDate"
                  />
                </FormControl>
                <FormLabel>Print Date</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="footerFontSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Footer Font Size</FormLabel>
                <FormControl>
                  <Input {...field} type="number" data-testid="input-footerFontSize" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="footerAlignment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Footer Alignment</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-footerAlignment">
                      <SelectValue placeholder="Select alignment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="footerTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Footer Template</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Enter custom footer text or HTML template (optional)"
                  rows={3}
                  data-testid="textarea-footerTemplate"
                />
              </FormControl>
              <FormDescription>
                Use variables like &#123;pageNumber&#125;, &#123;printDate&#125;, &#123;remark&#125;
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />

      {/* Table/Content Settings */}
      <div className="space-y-4">
        <h4 className="font-medium">Table & Content Settings</h4>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="tableFontSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Table Font Size</FormLabel>
                <FormControl>
                  <Input {...field} type="number" data-testid="input-tableFontSize" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showBorders"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <FormLabel>Show Table Borders</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showBorders"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <FormField
            control={form.control}
            name="showSerialNumber"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showSerialNumber"
                  />
                </FormControl>
                <FormLabel>Serial No.</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showProductCode"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showProductCode"
                  />
                </FormControl>
                <FormLabel>Product Code</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showQuantity"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showQuantity"
                  />
                </FormControl>
                <FormLabel>Quantity</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showRate"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showRate"
                  />
                </FormControl>
                <FormLabel>Rate</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showAmount"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showAmount"
                  />
                </FormControl>
                <FormLabel>Amount</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showTax"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showTax"
                  />
                </FormControl>
                <FormLabel>Tax</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showDiscount"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-showDiscount"
                  />
                </FormControl>
                <FormLabel>Discount</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Additional Settings */}
      <div className="space-y-4">
        <h4 className="font-medium">Additional Settings</h4>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="copies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Copies</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="1" data-testid="input-copies" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="colorPrint"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <FormLabel>Color Print</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-colorPrint"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="showWatermark"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel>Show Watermark</FormLabel>
                <FormDescription>Display watermark text on printed documents</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-showWatermark"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="watermarkText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Watermark Text</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} placeholder="e.g., DRAFT, COPY" data-testid="input-watermarkText" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel>Active Template</FormLabel>
                <FormDescription>Make this template active for printing</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-isActive"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
