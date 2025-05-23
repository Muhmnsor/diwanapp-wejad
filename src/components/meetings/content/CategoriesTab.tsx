
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddFolderDialog } from "../folders/AddFolderDialog";
import { useUserRoles } from "@/hooks/useUserRoles";
import { MeetingFoldersContainer } from "../folders/MeetingFoldersContainer";

export const CategoriesTab = () => {
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const { hasAdminRole } = useUserRoles();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const refreshFolders = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleOpenAddFolder = () => {
    setIsAddFolderOpen(true);
  };
  
  return (
    <Card className="rtl text-right">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="py-[9px]">تصنيفات الاجتماعات</CardTitle>
          <CardDescription>تنظيم الاجتماعات حسب التصنيف</CardDescription>
        </div>
        <Button onClick={() => setIsAddFolderOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة تصنيف جديد
        </Button>
      </CardHeader>
      <CardContent>
        <MeetingFoldersContainer 
          refreshTrigger={refreshTrigger} 
          onSuccess={refreshFolders}
          onAddFolder={handleOpenAddFolder} 
        />
        
        <AddFolderDialog 
          open={isAddFolderOpen} 
          onOpenChange={setIsAddFolderOpen} 
          onSuccess={refreshFolders} 
        />
      </CardContent>
    </Card>
  );
};
