
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
    <div className="p-4 space-y-3 bg-card grid grid-cols-1 md:grid-cols-2 gap-3">
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
