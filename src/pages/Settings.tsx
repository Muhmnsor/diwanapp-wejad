import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import Users from "./Users";
import { WhatsAppSettings } from "@/components/settings/WhatsAppSettings";
import { WhatsAppTemplates } from "@/components/settings/WhatsAppTemplates";

const Settings = () => {
  const { user } = useAuthStore();

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">إعدادات التطبيق</h1>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="users">إدارة المستخدمين</TabsTrigger>
          <TabsTrigger value="whatsapp">إعدادات الواتساب</TabsTrigger>
          <TabsTrigger value="templates">قوالب الرسائل</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Users />
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppSettings />
        </TabsContent>

        <TabsContent value="templates">
          <WhatsAppTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;