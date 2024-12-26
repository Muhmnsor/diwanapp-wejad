import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./whatsapp-settings/SettingsForm";

export const WhatsAppSettings = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    business_phone: "",
    api_key: "",
    account_id: "",
    whatsapp_number_id: "",
    callback_url: "",
  });

  const { data: settingsData, isLoading } = useQuery({
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

  useEffect(() => {
    if (settingsData) {
      setSettings({
        business_phone: settingsData.business_phone || "",
        api_key: settingsData.api_key || "",
        account_id: settingsData.account_id || "",
        whatsapp_number_id: settingsData.whatsapp_number_id || "",
        callback_url: settingsData.callback_url || "",
      });
    }
  }, [settingsData]);

  const mutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      if (settingsData?.id) {
        const { error } = await supabase
          .from("whatsapp_settings")
          .update(newSettings)
          .eq("id", settingsData.id);
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

  const testConnection = async () => {
    try {
      toast.loading("جاري اختبار الاتصال...");
      const response = await fetch("/api/test-whatsapp-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        toast.success("تم الاتصال بنجاح");
      } else {
        const error = await response.text();
        toast.error(`فشل الاتصال: ${error}`);
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      toast.error("حدث خطأ أثناء اختبار الاتصال");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(settings);
  };

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>إعدادات الواتساب</CardTitle>
      </CardHeader>
      <CardContent>
        <SettingsForm
          settings={settings}
          onSettingsChange={setSettings}
          onSubmit={handleSubmit}
          onTestConnection={testConnection}
        />
      </CardContent>
    </Card>
  );
};