
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersHeader } from "@/components/users/UsersHeader";
import { RoleManagement } from "@/components/users/RoleManagement";
import { ApplicationsManagement } from "@/components/users/applications/ApplicationsManagement";
import { useUsersData } from "@/components/users/hooks/useUsersData";

export const UsersManagement = () => {
  const { roles, users, isLoading, refetchUsers } = useUsersData();

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6 w-full" dir="rtl">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="roles">الأدوار والصلاحيات</TabsTrigger>
          <TabsTrigger value="applications">التطبيقات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4 w-full">
          <UsersHeader roles={roles} users={users} onUserCreated={refetchUsers} />
          <UsersTable users={users} onUserDeleted={refetchUsers} />
        </TabsContent>
        
        <TabsContent value="roles">
          <RoleManagement />
        </TabsContent>
        
        <TabsContent value="applications">
          <ApplicationsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
