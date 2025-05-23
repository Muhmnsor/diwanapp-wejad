
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppSettings } from "@/components/settings/WhatsAppSettings";
import { WhatsAppTemplates } from "@/components/settings/WhatsAppTemplates";
import { CertificateSignatures } from "@/components/certificates/signatures/CertificateSignatures";
import { CertificateTemplates } from "@/components/certificates/templates/CertificateTemplates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";

const Settings = () => {
  const { user } = useAuthStore();

  // Only show settings if user is admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <TopHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <h1 className="text-3xl font-bold mb-8">غير مصرح</h1>
          <p>عذراً، لا تملك صلاحية الوصول لهذه الصفحة.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">الإعدادات</h1>
        <Tabs defaultValue="whatsapp" className="space-y-4">
          <TabsList className="w-full justify-stretch bg-secondary/50">
            <TabsTrigger value="whatsapp" className="flex-1">إعدادات الواتساب</TabsTrigger>
            <TabsTrigger value="templates" className="flex-1">قوالب الرسائل</TabsTrigger>
            <TabsTrigger value="signatures" className="flex-1">التوقيعات</TabsTrigger>
            <TabsTrigger value="certificate-templates" className="flex-1">قوالب الشهادات</TabsTrigger>
          </TabsList>
          <TabsContent value="whatsapp">
            <WhatsAppSettings />
          </TabsContent>
          <TabsContent value="templates">
            <WhatsAppTemplates />
          </TabsContent>
          <TabsContent value="signatures">
            <CertificateSignatures />
          </TabsContent>
          <TabsContent value="certificate-templates">
            <CertificateTemplates />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;
