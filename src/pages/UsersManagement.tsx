
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { UsersManagement as UsersManagementComponent } from "@/components/settings/UsersManagement";

const UsersManagement = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">إدارة المستخدمين</h1>
        <UsersManagementComponent />
      </div>
      <Footer />
    </div>
  );
};

export default UsersManagement;
