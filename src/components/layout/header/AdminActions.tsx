
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Settings, Calendar, Plus } from "lucide-react";

interface AdminActionsProps {
  isAuthenticated: boolean;
  isEventsPage: boolean;
}

export const AdminActions = ({ isAuthenticated, isEventsPage }: AdminActionsProps) => {
  const navigate = useNavigate();

  if (!isAuthenticated || !isEventsPage) {
    return null;
  }

  return (
    <div className="flex justify-center items-center gap-2 md:gap-4 py-2 border-t">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => navigate("/dashboard")}
      >
        <LayoutDashboard className="h-4 w-4" />
        <span className="hidden md:inline">لوحة المعلومات</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => navigate("/settings")}
      >
        <Settings className="h-4 w-4" />
        <span className="hidden md:inline">الإعدادات</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => navigate("/")}
      >
        <Calendar className="h-4 w-4" />
        <span className="hidden md:inline">الأحداث</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => navigate("/events/create")}
      >
        <Plus className="h-4 w-4" />
        <span className="hidden md:inline">إنشاء فعالية</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => navigate("/create-project")}
      >
        <Plus className="h-4 w-4" />
        <span className="hidden md:inline">إنشاء مشروع</span>
      </Button>
    </div>
  );
};
