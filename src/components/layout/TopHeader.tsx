import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/refactored-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const TopHeader = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "تم تسجيل خروجك من النظام بنجاح.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل تسجيل الخروج",
        description: error.message || "حدث خطأ أثناء تسجيل الخروج.",
      });
    }
  };

const mainLinks = [
  { name: "الرئيسية", path: "/" },
  { name: "الفعاليات", path: "/events" },
  { name: "المشاريع", path: "/projects" },
  { name: "الطلبات", path: "/requests?tab=incoming" },
  { name: "الأفكار", path: "/ideas" },
  { name: "الشهادات", path: "/certificates" },
  { name: "المستندات", path: "/documents" },
  { name: "الاشتراكات", path: "/subscriptions" },
];

const adminLinks = [
  { name: "لوحة التحكم", path: "/admin" },
  { name: "المستخدمين", path: "/admin/users" },
  { name: "إدارة الطلبات", path: "/requests?tab=admin-view" },
  { name: "نظام المهام", path: "/tasks" },
  { name: "المالية", path: "/finance" },
  { name: "الإحصائيات", path: "/stats" },
];

  const isAdmin = user?.isAdmin || user?.role === 'developer' || user?.role === 'admin';

  return (
    <header className="bg-white dark:bg-gray-900 shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          منصة مجتمعي
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {mainLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.display_name} />
                  <AvatarFallback>{user?.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" dir="rtl">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">الملف الشخصي</Link>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  {adminLinks.map((link) => (
                    <DropdownMenuItem key={link.name} asChild>
                      <Link to={link.path}>{link.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer focus:bg-muted"
              >
                تسجيل الخروج
                <LogOut className="mr-2 h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="space-x-2">
            <Link to="/login">
              <Button variant="outline">تسجيل الدخول</Button>
            </Link>
            <Link to="/register">
              <Button>إنشاء حساب</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
