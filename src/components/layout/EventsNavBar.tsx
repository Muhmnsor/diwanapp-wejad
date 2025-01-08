import { Link } from "react-router-dom";
import { Database, Settings, PlusCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export const EventsNavBar = () => {
  const { isAuthenticated } = useAuthStore();

  console.log('Rendering EventsNavBar, isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full bg-secondary/20 py-2 border-b" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <Database className="h-4 w-4" />
              لوحة المعلومات
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              الإعدادات
            </Button>
          </Link>
          <Link to="/events/create">
            <Button variant="ghost" size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              إنشاء فعالية
            </Button>
          </Link>
          <Link to="/create-project">
            <Button variant="ghost" size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              إنشاء مشروع
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};