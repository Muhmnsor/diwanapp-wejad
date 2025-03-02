
import { Checkbox } from "@/components/ui/checkbox";
import { Permission } from "./types";

interface PermissionItemProps {
  permission: Permission;
  isSelected: boolean;
  onToggle: (permissionId: string) => void;
}

export const PermissionItem = ({ permission, isSelected, onToggle }: PermissionItemProps) => {
  return (
    <div className="flex items-start gap-3 mr-6">
      <Checkbox
        id={permission.id}
        checked={isSelected}
        onCheckedChange={() => onToggle(permission.id)}
      />
      <div>
        <label 
          htmlFor={permission.id}
          className="text-sm font-medium cursor-pointer block"
        >
          {permission.name}
        </label>
        {permission.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {permission.description}
          </p>
        )}
      </div>
    </div>
  );
};
