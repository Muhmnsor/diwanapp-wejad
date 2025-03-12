
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";

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
}

export const ModuleCollapsible = ({
  module,
  selectedPermissions,
  onPermissionToggle,
  onModuleToggle,
  toggleOpen
}: ModuleCollapsibleProps) => {
  return (
    <Collapsible
      open={module.isOpen}
      onOpenChange={() => toggleOpen(module.name)}
      className="w-full"
    >
      <Card className="w-full border">
        <CardHeader className="py-2 px-4">
          <CollapsibleTrigger className="flex w-full justify-between items-center">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`module-${module.name}`}
                checked={module.isAllSelected}
                onCheckedChange={() => onModuleToggle(module.name)}
                onClick={(e) => e.stopPropagation()}
              />
              <label
                htmlFor={`module-${module.name}`}
                className="text-base font-medium cursor-pointer flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onModuleToggle(module.name);
                }}
              >
                {module.name}
              </label>
            </div>
            {module.isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 px-4 pb-3">
            <div className="space-y-2">
              {module.permissions.map((permission) => (
                <div key={permission.id} className="flex items-start gap-2 pr-6">
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={selectedPermissions[permission.id] || false}
                    onCheckedChange={() => onPermissionToggle(permission.id)}
                  />
                  <div className="grid gap-1">
                    <label
                      htmlFor={`permission-${permission.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {permission.name}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
