import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppSettings } from "@/components/settings/WhatsAppSettings";
import { WhatsAppTemplates } from "@/components/settings/WhatsAppTemplates";
import { UsersManagement } from "@/components/settings/UsersManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">الإعدادات</h1>
        <Tabs defaultValue="whatsapp" className="space-y-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="whatsapp">إعدادات الواتساب</TabsTrigger>
            <TabsTrigger value="templates">قوالب الرسائل</TabsTrigger>
            <TabsTrigger value="users">إدارة المستخدمين</TabsTrigger>
          </TabsList>
          <TabsContent value="whatsapp">
            <WhatsAppSettings />
          </TabsContent>
          <TabsContent value="templates">
            <WhatsAppTemplates />
          </TabsContent>
          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;