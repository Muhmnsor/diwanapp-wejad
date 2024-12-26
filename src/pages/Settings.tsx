import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppSettings } from "@/components/settings/WhatsAppSettings";
import { WhatsAppTemplates } from "@/components/settings/WhatsAppTemplates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  return (
    <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">الإعدادات</h1>
        <Tabs defaultValue="whatsapp" className="space-y-4">
          <TabsList>
            <TabsTrigger value="whatsapp">إعدادات الواتساب</TabsTrigger>
            <TabsTrigger value="templates">قوالب الرسائل</TabsTrigger>
          </TabsList>
          <TabsContent value="whatsapp">
            <WhatsAppSettings />
          </TabsContent>
          <TabsContent value="templates">
            <WhatsAppTemplates />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;