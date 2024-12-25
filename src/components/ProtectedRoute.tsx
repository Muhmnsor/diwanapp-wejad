import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (location.pathname === '/login') {
      return;
    }

    if (!isAuthenticated) {
      console.log("ProtectedRoute - User not authenticated, redirecting to login");
      toast.error("يجب تسجيل الدخول للوصول إلى هذه الصفحة", {
        duration: 3000,
        onDismiss: () => {
          navigate("/login", { 
            replace: true,
            state: { from: location.pathname }
          });
        }
      });
    }
  }, [isAuthenticated, location.pathname]);

  if (!isAuthenticated && location.pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
};