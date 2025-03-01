
import { Navigation } from "@/components/Navigation";
import { UserNav } from "@/components/navigation/UserNav";
import { AdminNavLinks } from "@/components/navigation/AdminNavLinks";
import { Logo } from "@/components/layout/header/Logo"; // استيراد مكون الشعار الرئيسي بدلاً من المكون الآخر
import { CreateButtons } from "@/components/navigation/CreateButtons";
import { useAuthStore } from "@/store/authStore";

export const AdminHeader = () => {
  const { isAdmin } = useAuthStore();

  return (
    <div className="w-full bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-col" dir="rtl">
          <div className="flex flex-col xs:flex-row md:flex-row md:justify-between md:items-center py-2 md:py-4 gap-2 xs:gap-4">
            <Logo />
            <div className="flex items-center justify-center gap-2 mt-1 xs:mt-0 md:mt-0 flex-wrap xs:flex-nowrap">
              <Navigation />
              <CreateButtons />
              <UserNav />
            </div>
          </div>
          
          {isAdmin && (
            <div className="w-full">
              <div className="flex items-center justify-center md:justify-end py-2 md:py-3 border-t">
                <AdminNavLinks />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
