
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { UsersManagement as UsersManagementComponent } from "@/components/settings/UsersManagement";
import { Users } from "lucide-react";

const UsersManagement = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-center">إدارة المستخدمين</h1>
        </div>
        <div className="bg-muted/20 p-6 rounded-lg mb-6">
          <p className="text-center text-muted-foreground">
            يمكنك من خلال هذه الصفحة إدارة مستخدمي النظام وتعيين الأدوار والصلاحيات المناسبة لكل مستخدم
          </p>
        </div>
        <UsersManagementComponent />
      </div>
      <Footer />
    </div>
  );
};

export default UsersManagement;
