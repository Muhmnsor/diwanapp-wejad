
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
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">إدارة الاجتماعات</h1>
            <p className="text-muted-foreground">
              إدارة ومتابعة الاجتماعات والمهام والقرارات
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full md:w-auto justify-start">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>لوحة المعلومات</span>
            </TabsTrigger>
            
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              <span>تصنيف الاجتماعات</span>
            </TabsTrigger>
            
            {hasAdminRole && (
              <TabsTrigger value="all-meetings" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                <span>كل الاجتماعات</span>
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
