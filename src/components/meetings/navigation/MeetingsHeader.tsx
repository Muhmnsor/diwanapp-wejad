
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  return (
    <div className="w-full bg-white border-t py-3">
      <div className="container mx-auto">
        <TabsList className="w-full grid grid-cols-3 bg-secondary/20 p-1 rounded-xl">
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center gap-2 data-[state=active]:bg-white"
          >
            <LayoutDashboard className="h-4 w-4 ml-1" />
            لوحة المعلومات
          </TabsTrigger>
          
          <TabsTrigger 
            value="categories" 
            className="flex items-center gap-2 data-[state=active]:bg-white"
          >
            <FolderKanban className="h-4 w-4 ml-1" />
            تصنيف الاجتماعات
          </TabsTrigger>
          
          {hasAdminRole && (
            <TabsTrigger 
              value="all-meetings" 
              className="flex items-center gap-2 data-[state=active]:bg-white"
            >
              <ListTodo className="h-4 w-4 ml-1" />
              كل الاجتماعات
            </TabsTrigger>
          )}
        </TabsList>
      </div>
      <Separator className="mt-3" />
    </div>
  );
};
