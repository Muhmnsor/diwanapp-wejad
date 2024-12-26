import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const WhatsAppSettings = () => {
  const queryClient = useQueryClient();
  const [businessPhone, setBusinessPhone] = useState("");
  const [apiKey, setApiKey] = useState("");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["whatsapp-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Initialize form with existing settings
  useEffect(() => {
    if (settings) {
      setBusinessPhone(settings.business_phone);
      setApiKey(settings.api_key);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (newSettings: { business_phone: string; api_key: string }) => {
      if (settings?.id) {
        const { error } = await supabase
          .from("whatsapp_settings")
          .update(newSettings)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("whatsapp_settings")
          .insert([newSettings]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-settings"] });
      toast.success("تم حفظ الإعدادات بنجاح");
    },
    onError: (error) => {
      console.error("Error saving WhatsApp settings:", error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      business_phone: businessPhone,
      api_key: apiKey,
    });
  };

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الواتساب</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>رقم الواتساب</Label>
            <Input
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              placeholder="966500000000"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>مفتاح API</Label>
            <Input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              placeholder="أدخل مفتاح API"
              dir="ltr"
            />
          </div>
          <Button type="submit">حفظ الإعدادات</Button>
        </form>
      </CardContent>
    </Card>
  );
};