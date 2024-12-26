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
      console.log("Fetching WhatsApp settings...");
      const { data, error } = await supabase
        .from("whatsapp_settings")
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Error fetching WhatsApp settings:", error);
        throw error;
      }
      console.log("Fetched WhatsApp settings:", {
        ...data,
        api_key: data?.api_key ? "***" : undefined,
      });
      return data;
    },
  });

  useEffect(() => {
    if (settingsData) {
      console.log("Updating settings state with fetched data");
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
      console.log("Saving WhatsApp settings...");
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
      console.log("Current settings state:", {
        business_phone: settings.business_phone,
        api_key: settings.api_key ? "***" : "not set",
      });

      // Validate required fields before making the request
      const missingFields = [];
      if (!settings.business_phone) missingFields.push("رقم الواتساب");
      if (!settings.api_key) missingFields.push("مفتاح API");

      if (missingFields.length > 0) {
        const errorMessage = `الرجاء تعبئة الحقول التالية: ${missingFields.join("، ")}`;
        toast.error(errorMessage, { id: toastId });
        return;
      }

      console.log("Testing WhatsApp connection...");
      const response = await supabase.functions.invoke('test-whatsapp-connection', {
        body: {
          business_phone: settings.business_phone,
          api_key: settings.api_key,
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

  const sendTestMessage = async () => {
    const toastId = toast.loading("جاري إرسال رسالة تجريبية...");
    try {
      console.log("Current settings state:", {
        business_phone: settings.business_phone,
        api_key: settings.api_key ? "***" : "not set",
      });

      // Validate required fields before making the request
      const missingFields = [];
      if (!settings.business_phone) missingFields.push("رقم الواتساب");
      if (!settings.api_key) missingFields.push("مفتاح API");

      if (missingFields.length > 0) {
        const errorMessage = `الرجاء تعبئة الحقول التالية: ${missingFields.join("، ")}`;
        toast.error(errorMessage, { id: toastId });
        return;
      }

      console.log("Sending test WhatsApp message...");
      const response = await supabase.functions.invoke('send-whatsapp-test', {
        body: {
          business_phone: settings.business_phone,
          api_key: settings.api_key,
        }
      });

      if (response.error) {
        console.error("Supabase function error:", response.error);
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        toast.success("تم إرسال الرسالة التجريبية بنجاح", { id: toastId });
      } else {
        toast.error(response.data?.error || "فشل إرسال الرسالة", { id: toastId });
      }
    } catch (error) {
      console.error("Error sending test message:", error);
      toast.error("حدث خطأ أثناء إرسال الرسالة التجريبية", { id: toastId });
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
      onSendTestMessage={sendTestMessage}
    />
  );
};