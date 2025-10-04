import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WhatsAppSetup } from "@/components/WhatsAppSetup";
import { MessageSquare, CheckCircle, XCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WhatsAppSetupPage() {
  const [setupOpen, setSetupOpen] = useState(false);

  useEffect(() => {
    // Auto-open the setup dialog when the page loads
    setSetupOpen(true);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-green-600" />
            WhatsApp Setup
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure WhatsApp Web integration to send bills, receipts, and reminders
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Web Integration</CardTitle>
          <CardDescription>
            Connect your WhatsApp account to enable communication features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Click the button below to configure your WhatsApp connection. You'll need to scan a QR code with your WhatsApp mobile app.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg hover-elevate">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Send Bills & Receipts</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically send customer bills and payment receipts via WhatsApp
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover-elevate">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Payment Reminders</h4>
                  <p className="text-sm text-muted-foreground">
                    Send automated payment reminders to customers with outstanding balances
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover-elevate">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Message Templates</h4>
                  <p className="text-sm text-muted-foreground">
                    Create and manage custom message templates for different scenarios
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg hover-elevate">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Message History</h4>
                  <p className="text-sm text-muted-foreground">
                    Track all WhatsApp messages sent from the system
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <WhatsAppSetup />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
