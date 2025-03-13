
import { TabsContent } from "@/components/ui/tabs";
import { Role } from "../types";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { RolesListTabContent } from "./RolesListTabContent";
import { PermissionsTabContent } from "./PermissionsTabContent";

interface RoleManagementContentProps {
  roles: Role[];
  isLoading: boolean;
  selectedRoleId: string | null;
  activeTab: string;
  onSelectRole: (roleId: string) => void;
  onEditRole?: (role: Role) => void;
  onDeleteRole?: (role: Role) => void;
  onAddRole?: () => void;
  canEditRoles?: boolean;
}

export const RoleManagementContent = ({
  roles,
  isLoading,
  selectedRoleId,
  activeTab,
  onSelectRole,
  onEditRole,
  onDeleteRole,
  onAddRole,
  canEditRoles = false
}: RoleManagementContentProps) => {
  const selectedRole = roles.find(role => role.id === selectedRoleId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <>
      <TabsContent value="roles" className="space-y-4">
        <div className="flex justify-end">
          {canEditRoles && onAddRole && (
            <Button onClick={onAddRole}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة دور جديد
            </Button>
          )}
        </div>
        
        <RolesListTabContent 
          roles={roles} 
          onRoleSelected={onSelectRole} 
          onEditRole={canEditRoles ? onEditRole : undefined} 
          onDeleteRole={canEditRoles ? onDeleteRole : undefined}
        />
      </TabsContent>
      
      <TabsContent value="permissions">
        <PermissionsTabContent selectedRole={selectedRole} />
      </TabsContent>
    </>
  );
};
