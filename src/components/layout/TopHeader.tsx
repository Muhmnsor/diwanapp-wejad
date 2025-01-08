import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/navigation/UserNav";
import { useAuthStore } from "@/store/authStore";
import { Home } from "lucide-react";

export const TopHeader = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="border-b" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                الرئيسية
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <UserNav />
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};