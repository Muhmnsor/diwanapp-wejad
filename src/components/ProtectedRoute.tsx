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
    console.log("ProtectedRoute - Auth state:", isAuthenticated);

    if (location.pathname === '/login') {
      return;
    }

    if (!isAuthenticated) {
      console.log("ProtectedRoute - User not authenticated, showing toast");
      toast.error("يجب تسجيل الدخول للوصول إلى هذه الصفحة", {
        duration: 2000,
        onDismiss: () => {
          console.log("ProtectedRoute - Toast dismissed, redirecting to login");
          navigate("/login", { 
            replace: true,
            state: { from: location.pathname }
          });
        }
      });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Allow rendering login page even when not authenticated
  if (!isAuthenticated && location.pathname !== '/login') {
    console.log("ProtectedRoute - Returning null for protected route");
    return null;
  }

  console.log("ProtectedRoute - Rendering children");
  return <>{children}</>;
};