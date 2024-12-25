import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Logo } from "./Logo";

export const Navigation = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  console.log("Current user in Navigation:", user);

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Navigation - Login button clicked, redirecting to /login");
    navigate("/login");
  };

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-4">
            <Logo />
            <span className="text-2xl font-bold text-primary" style={{ fontFamily: 'Noto Kufi Arabic, sans-serif' }}>
              ديوان الفعاليات
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user?.isAdmin && (
            <>
              <Button variant="ghost" asChild>
                <Link to="/users">المستخدمين</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/create">إنشاء فعالية</Link>
              </Button>
            </>
          )}
          {user ? (
            <Button variant="outline" onClick={logout}>تسجيل خروج</Button>
          ) : (
            <Button variant="outline" onClick={handleLoginClick}>
              تسجيل دخول
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};