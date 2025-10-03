import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCompanyProfileSchema, type InsertCompanyProfile, type CompanyProfile } from "@shared/schema";
import { Upload, Building2, Save } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useEnterKeyNavigation } from "@/hooks/use-enter-key-navigation";

interface CompanySetupFormProps {
  currentFY: string;
}

export default function CompanySetupForm({ currentFY }: CompanySetupFormProps) {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['/api/company-profiles', currentFY],
    queryFn: async () => {
      const response = await fetch(`/api/company-profiles?fy=${currentFY}`);
      if (!response.ok) throw new Error('Failed to fetch company profiles');
      return response.json() as Promise<CompanyProfile[]>;
    },
  });

  const existingProfile = profiles.length > 0 ? profiles[0] : null;

  const form = useForm<InsertCompanyProfile>({
    resolver: zodResolver(insertCompanyProfileSchema),
    defaultValues: {
      financialYear: currentFY,
      companyName: "",
      phone1: "",
      phone2: "",
      whatsappNo: "",
      whatsappName: "",
      address: "",
      gst: "",
      licenseNo: "",
      email: "",
      website: "",
      remark: "",
      logoUrl: "",
      customFields: {},
    },
  });

  const formRef = useRef<HTMLFormElement>(null);
  useEnterKeyNavigation(formRef);

  useEffect(() => {
    if (existingProfile) {
      form.reset({
        financialYear: existingProfile.financialYear,
        companyName: existingProfile.companyName,
        phone1: existingProfile.phone1 || "",
        phone2: existingProfile.phone2 || "",
        whatsappNo: existingProfile.whatsappNo || "",
        whatsappName: existingProfile.whatsappName || "",
        address: existingProfile.address || "",
        gst: existingProfile.gst || "",
        licenseNo: existingProfile.licenseNo || "",
        email: existingProfile.email || "",
        website: existingProfile.website || "",
        remark: existingProfile.remark || "",
        logoUrl: existingProfile.logoUrl || "",
        customFields: existingProfile.customFields || {},
      });
      if (existingProfile.logoUrl) {
        setLogoPreview(existingProfile.logoUrl);
      }
    } else {
      form.reset({
        financialYear: currentFY,
        companyName: "",
        phone1: "",
        phone2: "",
        whatsappNo: "",
        whatsappName: "",
        address: "",
        gst: "",
        licenseNo: "",
        email: "",
        website: "",
        remark: "",
        logoUrl: "",
        customFields: {},
      });
      setLogoPreview("");
    }
  }, [existingProfile, currentFY, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertCompanyProfile) => {
      return await apiRequest('/api/company-profiles', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company-profiles'] });
      toast({
        title: "Success",
        description: "Company profile created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create company profile",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertCompanyProfile) => {
      return await apiRequest(`/api/company-profiles/${existingProfile?.id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company-profiles'] });
      toast({
        title: "Success",
        description: "Company profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update company profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCompanyProfile) => {
    if (existingProfile) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Logo file size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        form.setValue("logoUrl", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Company Setup</CardTitle>
        </div>
        <CardDescription>
          Configure your company details. This information will be displayed in the app header and on printed documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Logo</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {logoPreview && (
                            <div className="flex justify-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                              <img 
                                src={logoPreview} 
                                alt="Company Logo" 
                                className="max-h-32 object-contain"
                              />
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              data-testid="button-upload-logo"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {logoPreview ? "Change Logo" : "Upload Logo"}
                            </Button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleLogoUpload}
                            />
                            {logoPreview && (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                  setLogoPreview("");
                                  form.setValue("logoUrl", "");
                                }}
                                data-testid="button-remove-logo"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Recommended: PNG or JPG, max 5MB
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-company-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile No.</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" data-testid="input-phone1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Mobile No.</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" data-testid="input-phone2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp No.</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} type="tel" data-testid="input-whatsapp-no" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-whatsapp-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST No.</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-gst" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License No.</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-license-no" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} type="url" data-testid="input-website" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} rows={3} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="remark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remark</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} rows={2} data-testid="input-remark" />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        This will be displayed in the footer of printed documents
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-company"
              >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : existingProfile
                  ? "Update Company"
                  : "Save Company"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
