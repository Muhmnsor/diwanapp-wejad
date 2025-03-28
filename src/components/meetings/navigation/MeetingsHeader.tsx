
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, ListTodo } from "lucide-react";

interface MeetingsHeaderProps {
  hasAdminRole: boolean;
  activeTab: string;
}

export const MeetingsHeader = ({
  hasAdminRole,
  activeTab
}: MeetingsHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-full bg-white border-t py-0">
      <div className="flex justify-center">
        <TabsList className="grid grid-cols-3 bg-secondary/20 p-1 rounded-xl">
          <TabsTrigger 
            value="dashboard" 
            className="data-[state=active]:bg-white"
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>لوحة المعلومات</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="categories" 
            className="data-[state=active]:bg-white"
          >
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              <span>تصنيف الاجتماعات</span>
            </div>
          </TabsTrigger>
          
          {hasAdminRole && (
            <TabsTrigger 
              value="all-meetings" 
              className="data-[state=active]:bg-white"
            >
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                <span>كل الاجتماعات</span>
              </div>
            </TabsTrigger>
          )}
        </TabsList>
      </div>
    </div>
  );
};
