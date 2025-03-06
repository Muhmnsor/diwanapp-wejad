
import React from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBarIcon, FolderIcon, CalendarIcon, LayoutDashboardIcon, BarChartIcon } from "lucide-react";

interface TasksHeaderProps {
  showCacheMonitor?: boolean;
}

export const TasksHeader: React.FC<TasksHeaderProps> = ({ showCacheMonitor = false }) => {
  const navigate = useNavigate();
  const currentHash = window.location.hash.replace('#', '') || 'overview';
  
  const handleTabChange = (value: string) => {
    navigate(`#${value}`);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-3xl font-bold">المهام</h1>
      
      <Tabs value={currentHash} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <LayoutDashboardIcon className="h-4 w-4" />
            <span>نظرة عامة</span>
          </TabsTrigger>
          
          <TabsTrigger value="workspaces" className="flex items-center gap-1">
            <FolderIcon className="h-4 w-4" />
            <span>مساحات العمل</span>
          </TabsTrigger>
          
          <TabsTrigger value="yearly-plan" className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>الخطة السنوية</span>
          </TabsTrigger>
          
          <TabsTrigger value="reports" className="flex items-center gap-1">
            <ChartBarIcon className="h-4 w-4" />
            <span>التقارير</span>
          </TabsTrigger>
          
          {showCacheMonitor && (
            <TabsTrigger value="cache-monitor" className="flex items-center gap-1">
              <BarChartIcon className="h-4 w-4" />
              <span>أداء التخزين المؤقت</span>
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>
    </div>
  );
};
