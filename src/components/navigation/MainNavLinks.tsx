
import {
  FileText,
  CheckSquare,
  DollarSign,
  Globe,
  ShoppingBag,
  Users,
  Bell,
  FileEdit,
  MailOpen,
  Database,
  Lock
} from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useAuthStore } from "@/store/authStore";

export function MainNavLinks() {
  const { user } = useAuthStore();
  const isAdmin = user?.isAdmin || false;
  
  const links = [
    {
      href: "/documents",
      label: "المستندات",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      href: "/tasks",
      label: "المهام",
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      href: "/finance",
      label: "المالية",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      href: "/website",
      label: "الموقع",
      icon: <Globe className="h-5 w-5" />,
    },
    {
      href: "/store",
      label: "المتجر",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      href: "/users-management",
      label: "المستخدمين",
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: "/notifications",
      label: "الإشعارات",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      href: "/requests",
      label: "الطلبات",
      icon: <FileEdit className="h-5 w-5" />,
    },
    {
      href: "/digital-accounts",
      label: "الحسابات الرقمية",
      icon: <Lock className="h-5 w-5" />,
    },
  ];

  if (isAdmin) {
    links.push({
      href: "/admin/internal-mail",
      label: "البريد الداخلي",
      icon: <MailOpen className="h-5 w-5" />,
    });
  }

  return (
    <nav dir="rtl" className="flex flex-col items-start space-y-1 pr-1">
      {links.map(({ href, label, icon }) => (
        <NavLink
          key={href}
          to={href}
          className={({ isActive }) =>
            clsx(
              "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "hover:bg-secondary/30"
            )
          }
        >
          {icon}
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
