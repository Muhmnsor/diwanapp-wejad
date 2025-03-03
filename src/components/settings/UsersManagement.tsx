
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersHeader } from "@/components/users/UsersHeader";
import { RoleManagement } from "@/components/users/RoleManagement";
import { useUsersData } from "@/components/users/hooks/useUsersData";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ApplicationDialog } from "@/components/users/permissions/ApplicationDialog";

export const UsersManagement = () => {
  const { roles, users, isLoading, refetchUsers } = useUsersData();
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6 w-full" dir="rtl">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="roles">الأدوار والصلاحيات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4 w-full">
          <UsersHeader roles={roles} users={users} onUserCreated={refetchUsers} />
          <UsersTable users={users} onUserDeleted={refetchUsers} />
        </TabsContent>
        
        <TabsContent value="roles">
          <div className="mb-4 flex justify-between items-center">
            <Button 
              onClick={() => setIsApplicationDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              إضافة تطبيق جديد
            </Button>
          </div>
          <RoleManagement />
        </TabsContent>
      </Tabs>

      <ApplicationDialog 
        isOpen={isApplicationDialogOpen}
        onClose={() => setIsApplicationDialogOpen(false)}
        onSave={() => {
          setIsApplicationDialogOpen(false);
          // يمكن إضافة استدعاء لتحديث قائمة التطبيقات إذا لزم الأمر
        }}
      />
    </div>
  );
};
