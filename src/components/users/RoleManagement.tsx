
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRoleManagement } from "./hooks/useRoleManagement";
import { RolesTabContent } from "./roles/RolesTabContent";
import { PermissionsTabContent } from "./roles/PermissionsTabContent";
import { RoleDialogs } from "./roles/RoleDialogs";

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
          <TabsList className="mb-4">
            <TabsTrigger value="roles">قائمة الأدوار</TabsTrigger>
            <TabsTrigger value="permissions" disabled={!selectedRoleId}>
              صلاحيات الدور
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roles">
            <RolesTabContent 
              roles={roles}
              isLoading={isLoading}
              selectedRoleId={selectedRoleId}
              onAddRole={handleAddRole}
              onSelectRole={handleSelectRole}
              onEditRole={setRoleToEdit}
              onDeleteRole={setRoleToDelete}
              searchQuery=""
            />
          </TabsContent>
          
          <TabsContent value="permissions">
            <PermissionsTabContent 
              selectedRole={roles.find(role => role.id === selectedRoleId) || null} 
            />
          </TabsContent>
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
