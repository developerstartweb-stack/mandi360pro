import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, CheckCircle, XCircle, MessageSquare, QrCode, LogOut, RefreshCw } from "lucide-react";

interface WhatsAppStatus {
  isAuthenticated: boolean;
  isInitializing: boolean;
  qrCode: string | null;
  connectedPhone: string | null;
  status: 'connected' | 'qr_ready' | 'disconnected' | 'connecting';
}

export function WhatsAppSetup() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: status, isLoading, refetch } = useQuery<WhatsAppStatus>({
    queryKey: ['/api/whatsapp/status'],
    refetchInterval: (data) => {
      // Poll every 3 seconds if waiting for QR scan or connecting
      return data?.status === 'qr_ready' || data?.status === 'connecting' ? 3000 : false;
    },
    enabled: open,
  });

  const initializeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/whatsapp/initialize', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/status'] });
      toast({
        title: "Initializing WhatsApp",
        description: "Please wait for the QR code to appear...",
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

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/whatsapp/logout', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/status'] });
      toast({
        title: "Logged Out",
        description: "WhatsApp has been disconnected successfully",
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

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="button-whatsapp-setup"
        >
          <MessageSquare className="h-4 w-4" />
          WhatsApp Setup
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Web Integration
          </DialogTitle>
          <DialogDescription>
            Connect your WhatsApp account to send bills, receipts, and reminders directly to customers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Connection Status */}
              {status?.isAuthenticated ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Connected Successfully!</p>
                        {status.connectedPhone && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Phone: +{status.connectedPhone}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                        data-testid="button-logout-whatsapp"
                      >
                        {logoutMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </>
                        )}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : status?.status === 'disconnected' ? (
                <Alert className="bg-gray-50 border-gray-200">
                  <XCircle className="h-4 w-4 text-gray-600" />
                  <AlertDescription className="text-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Not Connected</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Initialize WhatsApp to get started
                        </p>
                      </div>
                      <Button
                        onClick={() => initializeMutation.mutate()}
                        disabled={initializeMutation.isPending}
                        size="sm"
                        data-testid="button-initialize-whatsapp"
                      >
                        {initializeMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <QrCode className="h-4 w-4 mr-2" />
                        )}
                        Initialize WhatsApp
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : null}

              {/* QR Code Display */}
              {status?.qrCode && !status.isAuthenticated && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <img
                          src={status.qrCode}
                          alt="WhatsApp QR Code"
                          className="w-64 h-64 border-2 border-gray-200 rounded-lg"
                          data-testid="image-whatsapp-qr"
                        />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="font-medium">Scan QR Code</p>
                        <ol className="text-sm text-muted-foreground text-left space-y-1 max-w-sm mx-auto">
                          <li>1. Open WhatsApp on your phone</li>
                          <li>2. Tap Menu or Settings → Linked Devices</li>
                          <li>3. Tap "Link a Device"</li>
                          <li>4. Point your phone at this screen to scan the code</li>
                        </ol>
                        <div className="flex justify-center pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            data-testid="button-refresh-qr"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh QR Code
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Connecting State */}
              {status?.isInitializing && !status?.qrCode && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Initializing WhatsApp Web...
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
