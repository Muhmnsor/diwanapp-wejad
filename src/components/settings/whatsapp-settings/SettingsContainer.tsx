import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SettingsForm } from "./SettingsForm";

interface WhatsAppSettings {
  business_phone: string;
  api_key: string;
  account_id: string;
  whatsapp_number_id: string;
  callback_url: string;
}

export const SettingsContainer = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<WhatsAppSettings>({
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
    mutationFn: async (newSettings: WhatsAppSettings) => {
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
    const toastId = toast.loading("جاري اختبار الاتصال...");
    try {
      console.log("Testing connection with settings:", {
        business_phone: settings.business_phone,
        api_key: "***", // Hide API key in logs
        account_id: settings.account_id,
        whatsapp_number_id: settings.whatsapp_number_id,
      });

      // Validate required fields before making the request
      if (!settings.business_phone || !settings.api_key || !settings.account_id || !settings.whatsapp_number_id) {
        toast.error("الرجاء تعبئة جميع الحقول المطلوبة", { id: toastId });
        return;
      }

      const response = await supabase.functions.invoke('test-whatsapp-connection', {
        body: {
          business_phone: settings.business_phone,
          api_key: settings.api_key,
          account_id: settings.account_id,
          whatsapp_number_id: settings.whatsapp_number_id,
        }
      });

      if (response.error) {
        console.error("Supabase function error:", response.error);
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        toast.success("تم الاتصال بنجاح", { id: toastId });
      } else {
        toast.error(response.data?.error || "فشل الاتصال", { id: toastId });
      }
    } catch (error) {
      console.error("Error testing connection:", error);
      toast.error("حدث خطأ أثناء اختبار الاتصال", { id: toastId });
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
    <SettingsForm
      settings={settings}
      onSettingsChange={setSettings}
      onSubmit={handleSubmit}
      onTestConnection={testConnection}
    />
  );
};