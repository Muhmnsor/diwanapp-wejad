
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  CalendarClock,
  FileBarChart,
  Settings,
  LayoutDashboard,
  GraduationCap,
  DollarSign
} from "lucide-react";

export function HRSecondaryHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => currentPath.endsWith(path);
  
  return (
    <div className="bg-muted/30 py-4 border-b mb-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start" dir="rtl">
          <Button
            variant={isActive('overview') || currentPath === "/admin/hr" ? "default" : "outline"}
            size="sm"
            onClick={() => navigate("/admin/hr/overview")}
            className="flex items-center gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>نظرة عامة</span>
          </Button>
          
          <Button
            variant={isActive('employees') ? "default" : "outline"}
            size="sm"
            onClick={() => navigate("/admin/hr/employees")}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span>الموظفين</span>
          </Button>
          
          <Button
            variant={isActive('attendance') ? "default" : "outline"}
            size="sm"
            onClick={() => navigate("/admin/hr/attendance")}
            className="flex items-center gap-2"
          >
            <CalendarClock className="h-4 w-4" />
            <span>الحضور والإجازات</span>
          </Button>
          
          <Button
            variant={isActive('training') ? "default" : "outline"}
            size="sm"
            onClick={() => navigate("/admin/hr/training")}
            className="flex items-center gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            <span>التدريب والتطوير</span>
          </Button>
          
          <Button
            variant={isActive('compensation') ? "default" : "outline"}
            size="sm"
            onClick={() => navigate("/admin/hr/compensation")}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            <span>التعويضات والمزايا</span>
          </Button>
          
          <Button
            variant={isActive('reports') ? "default" : "outline"}
            size="sm"
            onClick={() => navigate("/admin/hr/reports")}
            className="flex items-center gap-2"
          >
            <FileBarChart className="h-4 w-4" />
            <span>التقارير</span>
          </Button>
          
          <Button
            variant={isActive('settings') ? "default" : "outline"}
            size="sm"
            onClick={() => navigate("/admin/hr/settings")}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            <span>الإعدادات</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
