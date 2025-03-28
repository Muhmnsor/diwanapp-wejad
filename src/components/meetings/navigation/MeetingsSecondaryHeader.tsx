
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
    switch(value) {
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
    <div className="w-full bg-white border-t py-3">
      <div className="flex justify-center">
        <TabsList className="flex justify-center border-b rounded-none bg-white">
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            onClick={() => handleTabChange("dashboard")}
            data-state={activeTab === "dashboard" ? "active" : "inactive"}
          >
            <LayoutDashboard className="h-4 w-4 ml-1" />
            لوحة المعلومات
          </TabsTrigger>
          
          <TabsTrigger 
            value="categories" 
            className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            onClick={() => handleTabChange("categories")}
            data-state={activeTab === "categories" ? "active" : "inactive"}
          >
            <FolderKanban className="h-4 w-4 ml-1" />
            تصنيف الاجتماعات
          </TabsTrigger>
          
          {hasAdminRole && (
            <TabsTrigger 
              value="all-meetings" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
              onClick={() => handleTabChange("all-meetings")}
              data-state={activeTab === "all-meetings" ? "active" : "inactive"}
            >
              <ListTodo className="h-4 w-4 ml-1" />
              كل الاجتماعات
            </ListTodo>
          )}
        </TabsList>
      </div>
      <Separator className="mt-3" />
    </div>
  );
};
