
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
        <TabsList className="flex justify-center border-b rounded-none bg-white">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium">
            <LayoutDashboard className="h-4 w-4" />
            لوحة المعلومات
          </TabsTrigger>
          
          <TabsTrigger value="categories" className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium">
            <FolderKanban className="h-4 w-4" />
            تصنيف الاجتماعات
          </TabsTrigger>
          
          {hasAdminRole && (
            <TabsTrigger value="all-meetings" className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium">
              <ListTodo className="h-4 w-4" />
              كل الاجتماعات
            </TabsTrigger>
          )}
        </TabsList>
      </div>
    </div>
  );
};
