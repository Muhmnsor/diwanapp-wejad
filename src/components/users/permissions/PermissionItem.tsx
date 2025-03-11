
import { Checkbox } from "@/components/ui/checkbox";
import { PermissionData } from "./types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2 rtl:space-x-reverse hover:bg-muted/20 p-2 rounded-md">
            <Checkbox
              id={`permission-${permission.id}`}
              checked={isChecked}
              onCheckedChange={() => onToggle(permission.id)}
            />
            <label
              htmlFor={`permission-${permission.id}`}
              className="text-sm leading-none cursor-pointer select-none"
            >
              {permission.description}
            </label>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-secondary text-secondary-foreground">
          <p>{permission.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
