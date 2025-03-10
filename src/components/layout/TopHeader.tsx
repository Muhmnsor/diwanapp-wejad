
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/navigation/UserNav";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Home, Users, Settings, Code } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useDeveloperStore } from "@/store/developerStore";
import { useEffect } from "react";

export const TopHeader = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { settings, fetchSettings } = useDeveloperStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated, fetchSettings]);

  const isDeveloper = settings !== null;
  const isDevModeEnabled = settings?.is_enabled === true;

  const activeClass = "bg-primary/10 text-primary";

  const isActive = (path: string) => {
    return location.pathname === path ? activeClass : "";
  };

  if (!isAuthenticated) return null;

  return (
    <header className="bg-background border-b sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="hidden md:flex">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-xl">المجال</span>
            </Link>
          </div>
          
          <nav className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`hover:bg-primary/10 ${isActive("/")}`}
              asChild
            >
              <Link to="/">
                <Home className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">الرئيسية</span>
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`hover:bg-primary/10 ${isActive("/users")}`}
              asChild
            >
              <Link to="/users">
                <Users className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">المستخدمين</span>
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`hover:bg-primary/10 ${isActive("/user-settings")}`}
              asChild
            >
              <Link to="/user-settings">
                <Settings className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">الإعدادات</span>
              </Link>
            </Button>
            
            {isDeveloper && (
              <Button
                variant="ghost"
                size="sm"
                className={`hover:bg-primary/10 ${isActive("/developer-settings")}`}
                asChild
              >
                <Link to="/developer-settings">
                  <Code className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">إعدادات المطور</span>
                </Link>
              </Button>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </div>
    </header>
  );
};
