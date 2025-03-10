
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { AppPermissionsManager as AppPermissionsManagerComponent } from "@/components/admin/permissions/AppPermissionsManager";
import { Eye, Layout } from "lucide-react";

const AppPermissionsManager = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow" dir="rtl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Layout className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-center">إدارة ظهور التطبيقات</h1>
        </div>
        <div className="bg-muted/20 p-6 rounded-lg mb-6">
          <p className="text-center text-muted-foreground">
            يمكنك من خلال هذه الصفحة التحكم في ظهور التطبيقات في لوحة التحكم المركزية وربطها بالصلاحيات
          </p>
        </div>
        <AppPermissionsManagerComponent />
      </div>
      <Footer />
    </div>
  );
};

export default AppPermissionsManager;
