import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalState } from "@/lib/globalState";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { WhatsAppSetup } from "./WhatsAppSetup";
import WhatsAppSetupPage from "@/pages/WhatsAppSetupPage";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  Printer, 
  MessageSquare,
  FileText,
  Settings,
  X,
  Filter,
  Send,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import {
  insertWhatsappMessagesSchema,
  updateWhatsappMessagesSchema,
  insertWhatsappTemplatesSchema,
  updateWhatsappTemplatesSchema,
  insertWhatsappSettingsSchema,
  updateWhatsappSettingsSchema,
  type WhatsappMessages,
  type WhatsappTemplates,
  type WhatsappSettings
} from "@shared/schema";

type WhatsAppTab = "messages" | "templates" | "settings";

interface WhatsAppModuleProps {
  defaultTab?: WhatsAppTab;
  activeSubModule?: string;
}

export default function WhatsAppModule({ defaultTab = "messages", activeSubModule }: WhatsAppModuleProps) {
  const { state } = useGlobalState();
  const currentFY = state.currentFY;
  const [activeTab, setActiveTab] = useState<WhatsAppTab>(defaultTab);
  const [selectedFY, setSelectedFY] = useState(currentFY);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Reset selection and search when changing tabs to avoid cross-tab interference
  useEffect(() => {
    setSelectedRowId(null);
    setSearchTerm("");
  }, [activeTab]);
  
  const { toast } = useToast();

  // If activeSubModule is whatsapp-setup, show the setup page
  if (activeSubModule === "whatsapp-setup") {
    return <WhatsAppSetupPage />;
  }
  const queryClient = useQueryClient();

  // Tab configuration
  const tabs = [
    {
      id: "messages" as WhatsAppTab,
      label: "Messages",
      icon: MessageSquare,
      description: "View and manage WhatsApp messages"
    },
    {
      id: "templates" as WhatsAppTab,
      label: "Templates",
      icon: FileText,
      description: "Create and manage message templates"
    },
    {
      id: "settings" as WhatsAppTab,
      label: "Settings",
      icon: Settings,
      description: "Configure WhatsApp API settings"
    }
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            handleAdd();
            break;
          case 'e':
            e.preventDefault();
            if (selectedRowId) {
              handleEditSelected();
            }
            break;
          case 'd':
            e.preventDefault();
            if (selectedRowId) {
              handleDeleteSelected();
            }
            break;
          case 's':
            e.preventDefault();
            if (isFormOpen) {
              // Form save will be handled by forms
              const formSubmitButton = document.querySelector('[data-testid="button-save-form"]') as HTMLButtonElement;
              if (formSubmitButton) formSubmitButton.click();
            }
            break;
          case 'p':
            e.preventDefault();
            handlePrint();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [selectedRowId, isFormOpen]);

  // Action handlers
  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditSelected = () => {
    if (!selectedRowId) return;
    
    // Find the item from appropriate data source
    let item = null;
    if (activeTab === "messages" && messagesData) {
      item = messagesData.find((m: WhatsappMessages) => m.id === selectedRowId);
    } else if (activeTab === "templates" && templatesData) {
      item = templatesData.find((t: WhatsappTemplates) => t.id === selectedRowId);
    } else if (activeTab === "settings" && settingsData) {
      item = settingsData.find((s: WhatsappSettings) => s.id === selectedRowId);
    }
    
    if (item) {
      setEditingItem(item);
      setIsFormOpen(true);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedRowId) return;
    
    let mutation = null;
    if (activeTab === "messages") {
      mutation = deleteMessageMutation;
    } else if (activeTab === "templates") {
      mutation = deleteTemplateMutation;
    } else if (activeTab === "settings") {
      mutation = deleteSettingMutation;
    }
    
    if (mutation) {
      mutation.mutate(selectedRowId);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Data fetching queries
  const { data: messagesData, isLoading: messagesLoading } = useQuery<WhatsappMessages[]>({
    queryKey: ["/api/whatsapp-messages", selectedFY, searchTerm],
    enabled: activeTab === "messages"
  });

  const { data: templatesData, isLoading: templatesLoading } = useQuery<WhatsappTemplates[]>({
    queryKey: ["/api/whatsapp-templates", selectedFY, searchTerm],
    enabled: activeTab === "templates"
  });

  const { data: settingsData, isLoading: settingsLoading } = useQuery<WhatsappSettings[]>({
    queryKey: ["/api/whatsapp-settings", selectedFY],
    enabled: activeTab === "settings"
  });

  // Mutation functions
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/whatsapp-messages/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Success", description: "WhatsApp message deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp-messages"] });
      setSelectedRowId(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete WhatsApp message",
        variant: "destructive" 
      });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/whatsapp-templates/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Success", description: "WhatsApp template deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp-templates"] });
      setSelectedRowId(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete WhatsApp template",
        variant: "destructive" 
      });
    }
  });

  const deleteSettingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/whatsapp-settings/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({ title: "Success", description: "WhatsApp setting deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp-settings"] });
      setSelectedRowId(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete WhatsApp setting",
        variant: "destructive" 
      });
    }
  });

  // Helper function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Sent</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Messages table component
  const MessagesTable = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search-messages"
            />
          </div>
          <Select value={selectedFY} onValueChange={setSelectedFY}>
            <SelectTrigger className="w-32" data-testid="select-financial-year">
              <SelectValue placeholder="FY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-26">2025-26</SelectItem>
              <SelectItem value="2024-25">2024-25</SelectItem>
              <SelectItem value="2023-24">2023-24</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            data-testid="button-add-message"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Message (Ctrl+N)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditSelected}
            disabled={!selectedRowId}
            data-testid="button-edit-message"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit (Ctrl+E)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={!selectedRowId}
            data-testid="button-delete-message"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete (Ctrl+D)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            data-testid="button-print"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print (Ctrl+P)
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Message ID</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent Date</TableHead>
              <TableHead>Message Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messagesLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading messages...</TableCell>
              </TableRow>
            ) : (messagesData ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No messages found. Click "Add Message" to create one.
                </TableCell>
              </TableRow>
            ) : (
              (messagesData ?? []).map((message: WhatsappMessages, index: number) => (
                <TableRow
                  key={message.id}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedRowId === message.id ? "bg-muted" : ""
                  } animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedRowId(message.id)}
                  data-testid={`row-message-${message.id}`}
                >
                  <TableCell className="font-medium" data-testid={`text-message-id-${message.id}`}>
                    {message.messageId}
                  </TableCell>
                  <TableCell data-testid={`text-recipient-${message.id}`}>
                    {message.recipient}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{message.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(message.status)}
                  </TableCell>
                  <TableCell data-testid={`text-sent-date-${message.id}`}>
                    {message.sentAt ? new Date(message.sentAt).toLocaleDateString() : "Not sent"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" data-testid={`text-message-preview-${message.id}`}>
                    {message.messageText}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  // Templates table component
  const TemplatesTable = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search-templates"
            />
          </div>
          <Select value={selectedFY} onValueChange={setSelectedFY}>
            <SelectTrigger className="w-32" data-testid="select-financial-year">
              <SelectValue placeholder="FY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-26">2025-26</SelectItem>
              <SelectItem value="2024-25">2024-25</SelectItem>
              <SelectItem value="2023-24">2023-24</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            data-testid="button-add-template"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Template (Ctrl+N)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditSelected}
            disabled={!selectedRowId}
            data-testid="button-edit-template"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit (Ctrl+E)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={!selectedRowId}
            data-testid="button-delete-template"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete (Ctrl+D)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            data-testid="button-print"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print (Ctrl+P)
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template ID</TableHead>
              <TableHead>Template Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Usage Count</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Template Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templatesLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading templates...</TableCell>
              </TableRow>
            ) : (templatesData ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No templates found. Click "Add Template" to create one.
                </TableCell>
              </TableRow>
            ) : (
              (templatesData ?? []).map((template: WhatsappTemplates, index: number) => (
                <TableRow
                  key={template.id}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedRowId === template.id ? "bg-muted" : ""
                  } animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedRowId(template.id)}
                  data-testid={`row-template-${template.id}`}
                >
                  <TableCell className="font-medium" data-testid={`text-template-id-${template.id}`}>
                    {template.templateId}
                  </TableCell>
                  <TableCell data-testid={`text-template-name-${template.id}`}>
                    {template.templateName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.type}</Badge>
                  </TableCell>
                  <TableCell data-testid={`text-usage-count-${template.id}`}>
                    {template.usageCount || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" data-testid={`text-template-preview-${template.id}`}>
                    {template.templateText}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  // Settings table component
  const SettingsTable = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={selectedFY} onValueChange={setSelectedFY}>
            <SelectTrigger className="w-32" data-testid="select-financial-year">
              <SelectValue placeholder="FY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-26">2025-26</SelectItem>
              <SelectItem value="2024-25">2024-25</SelectItem>
              <SelectItem value="2023-24">2023-24</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            data-testid="button-add-setting"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Setting (Ctrl+N)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditSelected}
            disabled={!selectedRowId}
            data-testid="button-edit-setting"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit (Ctrl+E)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={!selectedRowId}
            data-testid="button-delete-setting"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete (Ctrl+D)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            data-testid="button-print"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print (Ctrl+P)
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Setting ID</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>API Provider</TableHead>
              <TableHead>Phone Number ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Message Limit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settingsLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading settings...</TableCell>
              </TableRow>
            ) : (settingsData ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No settings found. Click "Add Setting" to create one.
                </TableCell>
              </TableRow>
            ) : (
              (settingsData ?? []).map((setting: WhatsappSettings, index: number) => (
                <TableRow
                  key={setting.id}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedRowId === setting.id ? "bg-muted" : ""
                  } animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedRowId(setting.id)}
                  data-testid={`row-setting-${setting.id}`}
                >
                  <TableCell className="font-medium" data-testid={`text-setting-id-${setting.id}`}>
                    {setting.settingId}
                  </TableCell>
                  <TableCell data-testid={`text-business-name-${setting.id}`}>
                    {setting.businessName || setting.settingId}
                  </TableCell>
                  <TableCell data-testid={`text-api-provider-${setting.id}`}>
                    <Badge variant="outline">{setting.apiProvider}</Badge>
                  </TableCell>
                  <TableCell data-testid={`text-phone-number-id-${setting.id}`}>
                    {setting.phoneNumberId || "Not set"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={setting.isActive ? "default" : "secondary"}>
                      {setting.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell data-testid={`text-message-limit-${setting.id}`}>
                    {setting.messagesUsed || 0} / {setting.messageLimit || 1000}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Module</h1>
          <p className="text-muted-foreground">Manage WhatsApp messages, templates, and API settings</p>
        </div>
        <WhatsAppSetup />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as WhatsAppTab)}>
            <TabsList className="grid grid-cols-3 w-fit">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center space-x-2"
                  data-testid={`tab-${tab.id}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="messages" className="mt-6">
              <MessagesTable />
            </TabsContent>

            <TabsContent value="templates" className="mt-6">
              <TemplatesTable />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <SettingsTable />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Form dialog will be added here */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add ${activeTab.slice(0, -1)}`}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {/* Form components will be added here based on activeTab */}
            <p className="text-muted-foreground">Form implementation coming soon...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}