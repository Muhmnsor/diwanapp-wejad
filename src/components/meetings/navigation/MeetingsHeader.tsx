
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, ListTodo } from "lucide-react";

interface MeetingsHeaderProps {
  hasAdminRole: boolean;
}

export const MeetingsHeader = ({ hasAdminRole }: MeetingsHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Note: These routes will be implemented later
    // navigate(`/admin/meetings/${value}`);
  };

  return (
    <div className="w-full bg-white border-t py-3">
      <div className="flex justify-center">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="flex justify-center border-b rounded-none bg-white">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <LayoutDashboard className="h-4 w-4" />
              لوحة المعلومات
            </TabsTrigger>
            
            <TabsTrigger 
              value="categories" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <FolderKanban className="h-4 w-4" />
              تصنيف الاجتماعات
            </TabsTrigger>
            
            {hasAdminRole && (
              <TabsTrigger 
                value="all-meetings" 
                className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
              >
                <ListTodo className="h-4 w-4" />
                كل الاجتماعات
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
