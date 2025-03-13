
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersHeader } from "@/components/users/UsersHeader";
import { RoleManagement } from "@/components/users/RoleManagement";
import { useUsersData } from "@/components/users/hooks/useUsersData";
import { useDetailedPermissions } from "@/hooks/useDetailedPermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const UsersManagement = () => {
  const { roles, users, isLoading, refetchUsers } = useUsersData();
  const { hasPermission, isLoading: permissionsLoading } = useDetailedPermissions();

  // Check permissions for each tab
  const canManageUsers = hasPermission('users_manage');
  const canViewUsers = hasPermission('users_view');
  const canManageRoles = hasPermission('roles_manage');
  const canViewRoles = hasPermission('roles_view');

  if (isLoading || permissionsLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  // If user doesn't have any required permission, show access denied
  if (!canViewUsers && !canManageUsers && !canViewRoles && !canManageRoles) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4 ml-2" />
        <AlertDescription>
          ليس لديك الصلاحيات اللازمة للوصول إلى إدارة المستخدمين والأدوار
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 w-full" dir="rtl">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          {(canViewUsers || canManageUsers) && (
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
          )}
          {(canViewRoles || canManageRoles) && (
            <TabsTrigger value="roles">الأدوار والصلاحيات</TabsTrigger>
          )}
        </TabsList>
        
        {(canViewUsers || canManageUsers) && (
          <TabsContent value="users" className="space-y-4 w-full">
            <UsersHeader 
              roles={roles} 
              users={users} 
              onUserCreated={refetchUsers} 
              canCreateUsers={hasPermission('users_create')}
            />
            <UsersTable 
              users={users} 
              onUserDeleted={refetchUsers} 
              canDeleteUsers={hasPermission('users_delete')}
              canEditUsers={hasPermission('users_edit')}
            />
          </TabsContent>
        )}
        
        {(canViewRoles || canManageRoles) && (
          <TabsContent value="roles">
            <RoleManagement canEditRoles={hasPermission('roles_edit')} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
