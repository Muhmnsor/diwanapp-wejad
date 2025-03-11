
import { PermissionItem } from "../PermissionItem";
import { PermissionData } from "../types";

interface ModulePermissionsContentProps {
  permissions: PermissionData[];
  selectedPermissions: string[];
  onPermissionToggle: (permissionId: string) => void;
}

export const ModulePermissionsContent = ({
  permissions,
  selectedPermissions,
  onPermissionToggle,
}: ModulePermissionsContentProps) => {
  return (
    <div className="bg-background p-4 space-y-3">
      {permissions.map((permission) => (
        <PermissionItem
          key={permission.id}
          permission={permission}
          isChecked={selectedPermissions.includes(permission.id)}
          onToggle={onPermissionToggle}
        />
      ))}
    </div>
  );
};
