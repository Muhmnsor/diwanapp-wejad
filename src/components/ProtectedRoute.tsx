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
    console.log("ProtectedRoute - Checking authentication...");

    if (!isAuthenticated && location.pathname !== '/login') {
      console.log("ProtectedRoute - User not authenticated, redirecting to login");
      toast.error("يجب تسجيل الدخول للوصول إلى هذه الصفحة");
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  if (!isAuthenticated && location.pathname !== '/login') {
    console.log("ProtectedRoute - Rendering null for unauthenticated user");
    return null;
  }

  console.log("ProtectedRoute - Rendering children for authenticated user");
  return <>{children}</>;
};