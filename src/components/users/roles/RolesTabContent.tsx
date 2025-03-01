
import { Role } from "../types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RoleList } from "./RoleList";

interface RolesTabContentProps {
  roles: Role[];
  isLoading: boolean;
  selectedRoleId: string | null;
  onAddRole: () => void;
  onSelectRole: (roleId: string) => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
}

export const RolesTabContent = ({
  roles,
  isLoading,
  selectedRoleId,
  onAddRole,
  onSelectRole,
  onEditRole,
  onDeleteRole
}: RolesTabContentProps) => {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={onAddRole} className="gap-1">
          <Plus className="h-4 w-4" />
          إضافة دور جديد
        </Button>
      </div>
      
      <RoleList 
        roles={roles}
        isLoading={isLoading}
        selectedRoleId={selectedRoleId}
        onSelectRole={onSelectRole}
        onEditRole={onEditRole}
        onDeleteRole={onDeleteRole}
      />
    </div>
  );
};
