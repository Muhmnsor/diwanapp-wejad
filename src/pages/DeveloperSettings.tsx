
import { useState, useEffect } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Settings, Apps } from "lucide-react";
import { useAuthStore } from "@/store/refactored-auth";
import { isDeveloper } from "@/utils/developer/roleManagement";
import { AppPermissionsTab } from "@/components/developer/AppPermissionsTab";
import { DeveloperModeTab } from "@/components/developer/DeveloperModeTab";
import { Navigate } from "react-router-dom";

const DeveloperSettings = () => {
  const { user } = useAuthStore();
  const [hasDeveloperRole, setHasDeveloperRole] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDeveloperRole = async () => {
      if (!user) {
        setHasDeveloperRole(false);
        setIsLoading(false);
        return;
      }

      try {
        const hasDeveloperAccess = await isDeveloper(user.id);
        setHasDeveloperRole(hasDeveloperAccess);
      } catch (error) {
        console.error("Error checking developer role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDeveloperRole();
  }, [user]);

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  if (!hasDeveloperRole) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex items-center gap-3 mb-8">
          <Code className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">إعدادات المطور</h1>
        </div>

        <div className="bg-muted/20 p-6 rounded-lg mb-6">
          <p className="text-center text-muted-foreground">
            يمكنك من خلال هذه الصفحة إدارة إعدادات التطوير والتطبيقات المتاحة في النظام
          </p>
        </div>

        <Tabs defaultValue="apps" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="apps" className="flex items-center gap-2">
              <Apps className="h-4 w-4" />
              صلاحيات التطبيقات
            </TabsTrigger>
            <TabsTrigger value="developer-mode" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              وضع المطور
            </TabsTrigger>
          </TabsList>

          <TabsContent value="apps">
            <AppPermissionsTab />
          </TabsContent>

          <TabsContent value="developer-mode">
            <DeveloperModeTab />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default DeveloperSettings;
