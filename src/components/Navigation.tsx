import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth/authStore";

export const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <nav className="flex items-center gap-4">
      {isAuthenticated && user?.isAdmin && (
        <>
          <Link to="/apps">
            <Button variant="ghost">التطبيقات</Button>
          </Link>
          <Button variant="ghost" onClick={logout}>
            تسجيل الخروج
          </Button>
        </>
      )}
    </nav>
  );
};