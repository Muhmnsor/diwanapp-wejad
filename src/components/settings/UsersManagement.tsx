
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersHeader } from "@/components/users/UsersHeader";
import { RoleManagement } from "@/components/users/RoleManagement";
import { useUsersData } from "@/components/users/hooks/useUsersData";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { useState } from "react";
import { IdeasManagementDemo } from "@/components/users/permissions/demo/IdeasManagementDemo";

export const UsersManagement = () => {
  const { roles, users, isLoading, refetchUsers } = useUsersData();
  const [showIdeasDemo, setShowIdeasDemo] = useState(false);

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6 w-full" dir="rtl">
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setShowIdeasDemo(!showIdeasDemo)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Lightbulb className="w-4 h-4" />
          {showIdeasDemo ? "إخفاء تطبيق إدارة الأفكار" : "عرض تطبيق إدارة الأفكار"}
        </Button>
      </div>

      {showIdeasDemo && (
        <div className="mb-6">
          <IdeasManagementDemo />
        </div>
      )}
      
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
          <RoleManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
