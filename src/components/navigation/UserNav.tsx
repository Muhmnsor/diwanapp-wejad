import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const UserNav = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/login");
  };

  if (!isAuthenticated) return null;

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      <span>تسجيل الخروج</span>
    </Button>
  );
};