
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>تصنيفات الاجتماعات</CardTitle>
          <CardDescription>تنظيم الاجتماعات حسب التصنيف</CardDescription>
        </div>
        <Button 
          onClick={() => setIsAddFolderOpen(true)}
          disabled={!hasAdminRole}
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة تصنيف جديد
        </Button>
      </CardHeader>
      <CardContent>
        <MeetingFoldersContainer 
          refreshTrigger={refreshTrigger} 
          onSuccess={refreshFolders} 
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
