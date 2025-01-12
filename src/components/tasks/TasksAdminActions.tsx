import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, Settings, ListTodo } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export const TasksAdminActions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  
  // Only show in tasks/departments section
  if (!isAuthenticated || (!location.pathname.includes('/tasks') && !location.pathname.includes('/departments'))) {
    return null;
  }

  return (
    <div className="flex justify-center items-center gap-4 py-2 border-t" dir="rtl">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => navigate("/tasks")}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>الإدارات</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => navigate("/tasks/my-tasks")}
      >
        <ListTodo className="h-4 w-4" />
        <span>مهامي</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => navigate("/tasks/dashboard")}
      >
        <LayoutDashboard className="h-4 w-4" />
        <span>لوحة المعلومات</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => navigate("/tasks/settings")}
      >
        <Settings className="h-4 w-4" />
        <span>الإعدادات</span>
      </Button>
    </div>
  );
};