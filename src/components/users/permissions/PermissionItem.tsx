
import { Checkbox } from "@/components/ui/checkbox";
import { Permission } from "./types";

interface PermissionItemProps {
  permission: Permission;
  isChecked: boolean;
  onToggle: (permissionId: string) => void;
}

export const PermissionItem = ({
  permission,
  isChecked,
  onToggle,
}: PermissionItemProps) => {
  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <Checkbox
        id={`permission-${permission.id}`}
        checked={isChecked}
        onCheckedChange={() => onToggle(permission.id)}
      />
      <label
        htmlFor={`permission-${permission.id}`}
        className="text-sm leading-none cursor-pointer select-none"
      >
        {permission.name}
      </label>
    </div>
  );
};
