
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Module {
  name: string;
  description: string;
  permissions: Permission[];
  isOpen?: boolean;
  isAllSelected?: boolean;
}

interface ModuleCollapsibleProps {
  module: Module;
  selectedPermissions: Record<string, boolean>;
  onPermissionToggle: (permissionId: string) => void;
  onModuleToggle: (moduleName: string) => void;
  toggleOpen: (moduleName: string) => void;
  isReadOnly?: boolean;
}

export const ModuleCollapsible = ({
  module,
  selectedPermissions,
  onPermissionToggle,
  onModuleToggle,
  toggleOpen,
  isReadOnly = false
}: ModuleCollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    toggleOpen(module.name);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleOpenChange}
      className="bg-card border rounded-md mb-2"
    >
      <div className="p-4 flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <div className="flex items-center cursor-pointer space-x-2 space-x-reverse">
            {isOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            <h3 className="font-medium">{module.name}</h3>
          </div>
        </CollapsibleTrigger>
        <div className="flex items-center">
          <Switch 
            checked={module.isAllSelected}
            onCheckedChange={() => onModuleToggle(module.name)}
            disabled={isReadOnly}
          />
          <span className="mr-2 text-sm">
            {module.isAllSelected ? "تحديد الكل" : "تحديد الكل"}
          </span>
        </div>
      </div>
      <CollapsibleContent className="p-4 pt-0 border-t">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {module.permissions.map((permission) => (
            <div key={permission.id} className="flex items-start space-x-3 space-x-reverse p-2">
              <Checkbox 
                id={permission.id}
                checked={selectedPermissions[permission.id] || false}
                onCheckedChange={() => onPermissionToggle(permission.id)}
                disabled={isReadOnly}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label 
                  htmlFor={permission.id}
                  className="font-medium cursor-pointer"
                >
                  {permission.name}
                </Label>
                {permission.description && (
                  <p className="text-sm text-muted-foreground">{permission.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
