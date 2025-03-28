
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, ListTodo } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
    <div className="bg-muted/20 p-4 rounded-xl mb-6 rtl">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger 
          value="dashboard" 
          className="data-[state=active]:bg-white flex items-center gap-2 border-b-2 border-transparent data-[state=active]:border-primary"
        >
          <LayoutDashboard className="h-4 w-4" />
          لوحة المعلومات
        </TabsTrigger>
        
        <TabsTrigger 
          value="categories" 
          className="data-[state=active]:bg-white flex items-center gap-2 border-b-2 border-transparent data-[state=active]:border-primary"
        >
          <FolderKanban className="h-4 w-4" />
          تصنيف الاجتماعات
        </TabsTrigger>
        
        {hasAdminRole && (
          <TabsTrigger 
            value="all-meetings" 
            className="data-[state=active]:bg-white flex items-center gap-2 border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <ListTodo className="h-4 w-4" />
            كل الاجتماعات
          </TabsTrigger>
        )}
      </TabsList>
      <Separator className="mt-2" />
    </div>
  );
};
