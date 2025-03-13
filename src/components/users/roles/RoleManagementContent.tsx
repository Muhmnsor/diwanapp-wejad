
import { useState } from "react";
import { Role } from "../types";
import { RolesTabContent } from "./RolesTabContent";
import { PermissionsTabContent } from "./PermissionsTabContent";
import { TabsContent } from "@/components/ui/tabs";

interface RoleManagementContentProps {
  roles: Role[];
  isLoading: boolean;
  selectedRoleId: string | null;
  activeTab: string;
  onSelectRole: (roleId: string) => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
  onAddRole: () => void;
}

export const RoleManagementContent = ({
  roles,
  isLoading,
  selectedRoleId,
  activeTab,
  onSelectRole,
  onEditRole,
  onDeleteRole,
  onAddRole
}: RoleManagementContentProps) => {
  // العثور على الدور المحدد حاليا من قائمة الأدوار
  const selectedRole = roles.find(role => role.id === selectedRoleId);

  return (
    <>
      <TabsContent value="roles">
        <RolesTabContent 
          roles={roles}
          isLoading={isLoading}
          selectedRoleId={selectedRoleId}
          onAddRole={onAddRole}
          onSelectRole={onSelectRole}
          onEditRole={onEditRole}
          onDeleteRole={onDeleteRole}
        />
      </TabsContent>
      
      <TabsContent value="permissions">
        <PermissionsTabContent selectedRole={selectedRole} />
      </TabsContent>
    </>
  );
};
