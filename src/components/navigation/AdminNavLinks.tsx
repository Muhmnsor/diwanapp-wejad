import { Button } from "@/components/ui/button";
import { Apps } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminNavLinksProps {
  isActive: (path: string) => boolean;
  isMobile: boolean;
}

export const AdminNavLinks = ({ isActive, isMobile }: AdminNavLinksProps) => {
  const navigate = useNavigate();

  return (
    <Button
      variant={isActive("/admin") ? "default" : "ghost"}
      className="flex items-center gap-2"
      onClick={() => navigate("/admin")}
    >
      <Apps className="h-4 w-4" />
      <span>{!isMobile && "التطبيقات"}</span>
    </Button>
  );
};