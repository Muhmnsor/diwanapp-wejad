
import { PermissionData } from "../types";
import { PermissionItem } from "../PermissionItem";

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
    <div className="p-4 space-y-2 bg-card">
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
