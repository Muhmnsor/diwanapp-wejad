import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export const Navigation = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="flex items-center gap-4">
      {isAuthenticated && (
        <Button asChild variant="outline">
          <Link to="/create-event">إنشاء فعالية</Link>
        </Button>
      )}
    </nav>
  );
};