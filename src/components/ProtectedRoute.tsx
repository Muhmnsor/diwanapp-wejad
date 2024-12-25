import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    console.log("ProtectedRoute - Current path:", location.pathname);
    console.log("ProtectedRoute - Is authenticated:", isAuthenticated);

    if (!isAuthenticated && location.pathname !== '/login') {
      toast.error("يجب تسجيل الدخول للوصول إلى هذه الصفحة");
      navigate("/login");
    }
  }, [isAuthenticated, navigate, location]);

  return isAuthenticated ? <>{children}</> : null;
};