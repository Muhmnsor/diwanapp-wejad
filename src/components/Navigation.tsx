import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export const Navigation = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  console.log("Current user in Navigation:", user);
  console.log("Current location:", location.pathname);

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Navigation - Login button clicked, redirecting to /login");
    navigate("/login");
  };

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="flex justify-start">
      {user ? (
        <Button variant="outline" onClick={logout}>تسجيل خروج</Button>
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