
import { Link } from "react-router-dom";
import { Settings, Calendar, Target, BookOpen, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminNavLinksProps {
  isActive: (path: string) => boolean;
  isMobile: boolean;
}

export const AdminNavLinks = ({ isActive, isMobile }: AdminNavLinksProps) => {
  const links = [
    {
      href: "/events",
      label: "الفعاليات",
      icon: <Calendar className="h-4 w-4 md:h-5 md:w-5" />,
    },
    {
      href: "/projects",
      label: "المشاريع",
      icon: <Target className="h-4 w-4 md:h-5 md:w-5" />,
    },
    {
      href: "/ideas",
      label: "الأفكار",
      icon: <Lightbulb className="h-4 w-4 md:h-5 md:w-5" />,
    },
    {
      href: "/documents",
      label: "الوثائق",
      icon: <BookOpen className="h-4 w-4 md:h-5 md:w-5" />,
    },
    {
      href: "/settings",
      label: "الإعدادات",
      icon: <Settings className="h-4 w-4 md:h-5 md:w-5" />,
    }
  ];

  return (
    <>
      {links.map((link) => (
        <Link key={link.href} to={link.href}>
          <Button
            variant={isActive(link.href) ? "secondary" : "ghost"}
            className={isMobile ? "p-2 h-9" : ""}
            size={isMobile ? "sm" : "default"}
          >
            {link.icon}
            {!isMobile && <span className="mr-2">{link.label}</span>}
          </Button>
        </Link>
      ))}
    </>
  );
};
