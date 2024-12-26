import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const TopHeader = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/login");
  };

  return (
    <div className="w-full bg-white py-4 border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex justify-start">
            <img 
              src="/lovable-uploads/cc0ac885-dec0-4720-b30c-27371944cda6.png" 
              alt="ديوان" 
              className="h-24 object-contain cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>
          <div className="flex-1 flex items-center gap-4 justify-end">
            <Navigation />
            {isAuthenticated ? (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span>تسجيل الدخول</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};