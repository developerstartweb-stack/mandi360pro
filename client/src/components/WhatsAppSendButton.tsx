import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, MessageSquare, Send, AlertCircle, CheckCircle } from "lucide-react";

interface WhatsAppSendButtonProps {
  phoneNumber: string;
  message: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  onSuccess?: () => void;
  customerName?: string;
}

export function WhatsAppSendButton({
  phoneNumber,
  message,
  disabled = false,
  variant = "outline",
  size = "sm",
  onSuccess,
  customerName,
}: WhatsAppSendButtonProps) {
  const [open, setOpen] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const [editedPhone, setEditedPhone] = useState(phoneNumber);
  const { toast } = useToast();

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/whatsapp/status'],
    enabled: open,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/whatsapp/send', {
        phoneNumber: editedPhone,
        message: editedMessage,
      });
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: `WhatsApp message sent successfully to ${customerName || editedPhone}`,
      });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!editedPhone || !editedMessage) {
      toast({
        title: "Missing Information",
        description: "Phone number and message are required",
        variant: "destructive",
      });
      return;
    }
    sendMutation.mutate();
  };

  const handleOpen = () => {
    setEditedMessage(message);
    setEditedPhone(phoneNumber);
    setOpen(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpen}
        disabled={disabled || !phoneNumber}
        className="gap-2"
        data-testid="button-send-whatsapp"
      >
        <MessageSquare className="h-4 w-4" />
        Send via WhatsApp
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Send WhatsApp Message
            </DialogTitle>
            <DialogDescription>
              {customerName ? `Send message to ${customerName}` : "Review and send your message"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {statusLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : !status?.isAuthenticated ? (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  WhatsApp is not connected. Please set up WhatsApp Web from the Settings page before sending messages.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  WhatsApp is connected and ready to send
                  {status.connectedPhone && ` from +${status.connectedPhone}`}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input
                id="phone-number"
                value={editedPhone}
                onChange={(e) => setEditedPhone(e.target.value)}
                placeholder="Enter phone number (e.g., 9876543210)"
                data-testid="input-phone-number"
              />
              <p className="text-xs text-muted-foreground">
                Enter 10-digit mobile number (without +91)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                rows={8}
                className="resize-none font-mono text-sm"
                placeholder="Type your message here..."
                data-testid="textarea-message"
              />
              <p className="text-xs text-muted-foreground">
                {editedMessage.length} characters
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={sendMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sendMutation.isPending || !status?.isAuthenticated || !editedPhone || !editedMessage}
                data-testid="button-confirm-send"
              >
                {sendMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
