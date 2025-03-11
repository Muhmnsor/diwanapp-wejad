
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { useRoleManagement } from "./hooks/useRoleManagement";
import { RoleManagementContent } from "./roles/RoleManagementContent";
import { TabsNavigation } from "./roles/TabsNavigation";
import { RoleDialogs } from "./roles/RoleDialogs";
import { useEffect } from "react";
import { initializeDeveloperRole } from "@/utils/developerRole";
import { initializeDefaultPermissions, initializeAdminRole } from "@/utils/permissions/initializePermissions";

export const RoleManagement = () => {
  const {
    roles,
    isLoading,
    roleToEdit,
    setRoleToEdit,
    roleToDelete,
    setRoleToDelete,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedRoleId,
    activeTab,
    setActiveTab,
    handleAddRole,
    handleRoleSaved,
    handleRoleDeleted,
    handleSelectRole
  } = useRoleManagement();

  useEffect(() => {
    // Initialize developer role
    initializeDeveloperRole();
    
    // Initialize permissions
    initializeDefaultPermissions().then(() => {
      // After permissions are initialized, set up the admin role
      initializeAdminRole();
    });
  }, []);

  return (
    <Card className="shadow-sm" dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">إدارة الأدوار</CardTitle>
        <CardDescription>
          إضافة وتعديل أدوار المستخدمين في النظام
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
          <TabsNavigation selectedRoleId={selectedRoleId} />
          
          <RoleManagementContent 
            roles={roles}
            isLoading={isLoading}
            selectedRoleId={selectedRoleId}
            activeTab={activeTab}
            onSelectRole={handleSelectRole}
            onEditRole={setRoleToEdit}
            onDeleteRole={setRoleToDelete}
            onAddRole={handleAddRole}
          />
        </Tabs>
      </CardContent>

      <RoleDialogs 
        roleToEdit={roleToEdit}
        roleToDelete={roleToDelete}
        isAddDialogOpen={isAddDialogOpen}
        onCloseEditDialog={() => {
          setIsAddDialogOpen(false);
          setRoleToEdit(null);
        }}
        onCloseDeleteDialog={() => setRoleToDelete(null)}
        onRoleSaved={handleRoleSaved}
        onRoleDeleted={handleRoleDeleted}
      />
    </Card>
  );
};
