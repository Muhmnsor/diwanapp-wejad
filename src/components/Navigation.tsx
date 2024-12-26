import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Plus, Settings } from "lucide-react";

export const Navigation = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  console.log("Current user in Navigation:", user);
  console.log("Current location:", location.pathname);

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/login");
  };

  const handleCreateEventClick = () => {
    navigate("/create-event");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="flex justify-start items-center gap-2">
      {user ? (
        <>
          <Button 
            variant="default" 
            onClick={handleCreateEventClick}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إنشاء فعالية
          </Button>
          {user.isAdmin && (
            <Button
              variant="outline"
              onClick={handleSettingsClick}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              الإعدادات
            </Button>
          )}
          <Button variant="outline" onClick={logout}>تسجيل خروج</Button>
        </>
      ) : (
        !isLoginPage && (
          <Button variant="outline" onClick={handleLoginClick}>
            تسجيل دخول
          </Button>
        )
      )}
    </div>
  );
};