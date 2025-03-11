
import { Check } from "lucide-react";
import { PermissionData } from "./types";

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
    <div
      className="flex items-start p-2 hover:bg-muted/20 rounded cursor-pointer"
      onClick={() => onToggle(permission.id)}
      data-permission-id={permission.id}
    >
      <div
        className={`w-5 h-5 mt-0.5 border rounded flex items-center justify-center mr-2 ${
          isChecked
            ? "bg-primary border-primary text-primary-foreground"
            : "border-input"
        }`}
      >
        {isChecked && <Check className="h-3.5 w-3.5" />}
      </div>
      <div>
        <div className="font-medium text-sm">{permission.description}</div>
        <div className="text-xs text-muted-foreground">{permission.name}</div>
      </div>
    </div>
  );
};
