
import { Checkbox } from "@/components/ui/checkbox";
import { PermissionData } from "./types";
import { cn } from "@/lib/utils";

interface PermissionItemProps {
  permission: PermissionData;
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
        className={cn(
          "data-[state=indeterminate]:bg-primary/50 data-[state=indeterminate]:text-primary-foreground"
        )}
      />
      <label
        htmlFor={`permission-${permission.id}`}
        className="text-sm leading-none cursor-pointer select-none"
      >
        {permission.description || permission.display_name || permission.name}
      </label>
    </div>
  );
};
