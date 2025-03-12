
import { useLocation } from "react-router-dom";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersHeader } from "@/components/users/UsersHeader";
import { RoleManagement } from "@/components/users/RoleManagement";
import { useUsersData } from "@/components/users/hooks/useUsersData";
import { PermissionsManagement } from "@/components/users/permissions/PermissionsManagement";

export const UsersManagement = () => {
  const { roles, users, isLoading, refetchUsers } = useUsersData();
  const location = useLocation();
  
  // Parse the active tab from URL query or default to "users"
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get('tab') || 'users';

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6 w-full" dir="rtl">
      {activeTab === 'users' && (
        <div className="space-y-4 w-full">
          <UsersHeader roles={roles} users={users} onUserCreated={refetchUsers} />
          <UsersTable users={users} onUserDeleted={refetchUsers} />
        </div>
      )}
      
      {activeTab === 'roles' && (
        <RoleManagement />
      )}
      
      {activeTab === 'permissions' && (
        <PermissionsManagement />
      )}
    </div>
  );
};
