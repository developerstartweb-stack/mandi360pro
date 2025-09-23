import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Settings, RefreshCw, FileText, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Button
} from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Input
} from '@/components/ui/input';
import {
  Textarea
} from '@/components/ui/textarea';
import {
  Switch
} from '@/components/ui/switch';
import {
  Badge
} from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Separator
} from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useGlobalState } from '@/lib/globalState';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { insertAccountingIntegrationsSchema, type AccountingIntegrations } from '@shared/schema';
import { z } from 'zod';

const accountingPlatforms = [
  { value: 'QuickBooks', label: 'QuickBooks Online', icon: '🧾' },
  { value: 'Xero', label: 'Xero', icon: '📊' },
  { value: 'Sage', label: 'Sage Business Cloud', icon: '🏢' },
  { value: 'Tally', label: 'Tally ERP', icon: '🧮' },
  { value: 'Manual', label: 'Manual Export', icon: '📤' },
];

const formSchema = insertAccountingIntegrationsSchema.extend({
  connectionName: z.string().min(1, "Connection name is required"),
  syncCustomers: z.boolean().optional(),
  syncProducts: z.boolean().optional(),
  syncInvoices: z.boolean().optional(),
  syncPayments: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

function AccountingIntegrationModule() {
  const { state } = useGlobalState();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<AccountingIntegrations | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: 'QuickBooks',
      authType: 'oauth',
      isActive: true,
      connectionName: '',
      syncCustomers: true,
      syncProducts: true,
      syncInvoices: true,
      syncPayments: true,
    },
  });

  // Fetch integrations
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['/api/accounting/integrations', state.currentFY],
    queryFn: () => fetch(`/api/accounting/integrations?financialYear=${state.currentFY}`).then(res => res.json()),
  });

  // Fetch sync logs for selected integration
  const { data: syncLogs } = useQuery({
    queryKey: ['/api/accounting/sync-logs', selectedIntegration?.id],
    queryFn: () => selectedIntegration ? 
      fetch(`/api/accounting/sync-logs?integrationId=${selectedIntegration.id}&financialYear=${state.currentFY}&limit=50`)
        .then(res => res.json()) : null,
    enabled: !!selectedIntegration && showLogsDialog,
  });

  // Create integration mutation
  const createMutation = useMutation({
    mutationFn: (data: FormData) => apiRequest('/api/accounting/integrations', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/integrations'] });
      setShowAddDialog(false);
      form.reset();
      toast({
        title: "Integration Created",
        description: "Accounting software integration has been set up successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create integration",
      });
    },
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: ({ integrationId, syncType }: { integrationId: string, syncType: string }) => 
      apiRequest(`/api/accounting/integrations/${integrationId}/sync`, 'POST', { syncType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounting/integrations'] });
      setShowSyncDialog(false);
      toast({
        title: "Sync Initiated",
        description: "Data synchronization has been started.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: error.message || "Failed to start synchronization",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const settings = {
      syncCustomers: data.syncCustomers,
      syncProducts: data.syncProducts,
      syncInvoices: data.syncInvoices,
      syncPayments: data.syncPayments,
    };

    const integrationData = {
      ...data,
      financialYear: state.currentFY,
      settings,
    };

    createMutation.mutate(integrationData);
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'syncing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'syncing': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Accounting Integrations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="accounting-integration-module">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="text-title">
            Accounting Integrations
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Connect with popular accounting software for seamless financial management
          </p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-integration">
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Accounting Integration</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accounting Platform</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-platform">
                            <SelectValue placeholder="Choose platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accountingPlatforms.map((platform) => (
                            <SelectItem key={platform.value} value={platform.value}>
                              <div className="flex items-center gap-2">
                                <span>{platform.icon}</span>
                                {platform.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="connectionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connection Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="My QuickBooks Connection"
                          {...field}
                          data-testid="input-connection-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authentication Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-auth-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="oauth">OAuth (Recommended)</SelectItem>
                          <SelectItem value="api_key">API Key</SelectItem>
                          <SelectItem value="manual">Manual Export</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Sync Settings</h4>
                  
                  <FormField
                    control={form.control}
                    name="syncCustomers"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Sync Customers</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-sync-customers"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="syncProducts"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Sync Products</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-sync-products"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="syncInvoices"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Sync Invoices</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-sync-invoices"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="syncPayments"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Sync Payments</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-sync-payments"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-save"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Integration"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {integrations?.length ? (
          integrations.map((integration: AccountingIntegrations) => (
            <Card key={integration.id} className="hover-elevate" data-testid={`card-integration-${integration.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">
                      {accountingPlatforms.find(p => p.value === integration.platform)?.icon}
                    </span>
                    {integration.connectionName}
                  </CardTitle>
                  <Badge
                    className={getSyncStatusColor(integration.syncStatus || 'pending')}
                    data-testid={`badge-status-${integration.id}`}
                  >
                    <div className="flex items-center gap-1">
                      {getSyncStatusIcon(integration.syncStatus || 'pending')}
                      {integration.syncStatus || 'pending'}
                    </div>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {integration.platform} • {integration.authType}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Last Sync:</p>
                    <p className="font-medium">
                      {integration.lastSyncAt 
                        ? new Date(integration.lastSyncAt).toLocaleDateString()
                        : 'Never'
                      }
                    </p>
                  </div>
                  
                  {integration.syncError && (
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {integration.syncError}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setShowSyncDialog(true);
                      }}
                      data-testid={`button-sync-${integration.id}`}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Sync
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setShowConfigDialog(true);
                      }}
                      data-testid={`button-config-${integration.id}`}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Config
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setShowLogsDialog(true);
                      }}
                      data-testid={`button-logs-${integration.id}`}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Integrations Yet</p>
                <p className="text-sm">
                  Connect with your favorite accounting software to start syncing your financial data.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose what data to synchronize with {selectedIntegration?.platform}
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              {['customers', 'products', 'invoices', 'payments'].map((syncType) => (
                <Button
                  key={syncType}
                  variant="outline"
                  onClick={() => {
                    if (selectedIntegration) {
                      syncMutation.mutate({
                        integrationId: selectedIntegration.id,
                        syncType,
                      });
                    }
                  }}
                  disabled={syncMutation.isPending}
                  data-testid={`button-sync-${syncType}`}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync {syncType}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sync Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sync Logs</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {syncLogs?.length ? (
              <div className="space-y-2">
                {syncLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 border rounded-lg"
                    data-testid={`log-${log.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getSyncStatusColor(log.status)}>
                        {getSyncStatusIcon(log.status)}
                        {log.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.startedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">
                      {log.operation} {log.syncType} - {log.recordsProcessed} records
                    </p>
                    {log.details && (
                      <pre className="text-xs mt-2 p-2 bg-muted rounded">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No sync logs found
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AccountingIntegrationModule;