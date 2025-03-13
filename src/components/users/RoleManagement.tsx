
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { useRoleManagement } from "./hooks/useRoleManagement";
import { RoleManagementContent } from "./roles/RoleManagementContent";
import { TabsNavigation } from "./roles/TabsNavigation";
import { RoleDialogs } from "./roles/RoleDialogs";
import { useEffect } from "react";
import { initializeDeveloperRole } from "@/utils/developerRole";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useDetailedPermissions } from "@/hooks/useDetailedPermissions";

interface RoleManagementProps {
  canEditRoles?: boolean;
}

export const RoleManagement = ({ canEditRoles = false }: RoleManagementProps) => {
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

  const { hasPermission } = useDetailedPermissions();
  
  // Double-check permissions
  const hasViewPermission = hasPermission('roles_view');
  const hasEditPermission = canEditRoles || hasPermission('roles_edit');
  const hasManagePermission = hasPermission('roles_manage');

  useEffect(() => {
    // Initialize developer role
    initializeDeveloperRole();
  }, []);

  if (!hasViewPermission && !hasEditPermission && !hasManagePermission) {
    return (
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4 ml-2" />
        <AlertDescription>
          ليس لديك الصلاحيات اللازمة لعرض أو إدارة الأدوار
        </AlertDescription>
      </Alert>
    );
  }

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
            onEditRole={hasEditPermission ? setRoleToEdit : undefined}
            onDeleteRole={hasEditPermission ? setRoleToDelete : undefined}
            onAddRole={hasEditPermission ? handleAddRole : undefined}
            canEditRoles={hasEditPermission}
          />
        </Tabs>
      </CardContent>

      {hasEditPermission && (
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
      )}
    </Card>
  );
};
