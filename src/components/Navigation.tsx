import { Button } from "@/components/ui/button";
import { Plus, LogIn, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuthStore } from "@/store/authStore";

export const Navigation = () => {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary flex items-center">
          <Logo />
          ديوان الفعاليات
        </Link>
        <div className="flex gap-2">
          {isAuthenticated ? (
            <>
              <Button asChild>
                <Link to="/create" className="flex items-center gap-2">
                  <Plus size={20} />
                  فعالية جديدة
                </Link>
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut size={20} className="ml-2" />
                تسجيل الخروج
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/login" className="flex items-center gap-2">
                <LogIn size={20} />
                تسجيل الدخول
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};