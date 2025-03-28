
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, FolderKanban, ListTodo } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

interface MeetingsSecondaryHeaderProps {
  hasAdminRole: boolean;
  activeTab: string;
}

export const MeetingsSecondaryHeader = ({
  hasAdminRole,
  activeTab
}: MeetingsSecondaryHeaderProps) => {
  const navigate = useNavigate();
  
  const handleTabChange = (value: string) => {
    switch (value) {
      case "dashboard":
        navigate("/admin/meetings");
        break;
      case "categories":
        navigate("/admin/meetings?tab=categories");
        break;
      case "all-meetings":
        navigate("/admin/meetings?tab=all-meetings");
        break;
      default:
        navigate("/admin/meetings");
    }
  };
  
  return (
    <div className="w-full bg-white border-t py-0">
      <div className="flex justify-center py-0 my-0">
        <TabsList className="flex justify-center border-b-0 rounded-lg bg-gray-50 p-1 flex-row-reverse my-4" dir="rtl">
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold rounded-md transition-all" 
            onClick={() => handleTabChange("dashboard")} 
            data-state={activeTab === "dashboard" ? "active" : "inactive"}
          >
            <LayoutDashboard className="h-4 w-4 ml-1.5" />
            لوحة المعلومات
          </TabsTrigger>
          
          <TabsTrigger 
            value="categories" 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold rounded-md transition-all" 
            onClick={() => handleTabChange("categories")} 
            data-state={activeTab === "categories" ? "active" : "inactive"}
          >
            <FolderKanban className="h-4 w-4 ml-1.5" />
            تصنيف الاجتماعات
          </TabsTrigger>
          
          {hasAdminRole && (
            <TabsTrigger 
              value="all-meetings" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-semibold rounded-md transition-all" 
              onClick={() => handleTabChange("all-meetings")} 
              data-state={activeTab === "all-meetings" ? "active" : "inactive"}
            >
              <ListTodo className="h-4 w-4 ml-1.5" />
              كل الاجتماعات
            </TabsTrigger>
          )}
        </TabsList>
      </div>
      <Separator className="mt-0 my-0" />
    </div>
  );
};
