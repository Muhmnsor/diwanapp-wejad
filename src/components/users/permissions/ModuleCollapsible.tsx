
import React, { useState, useMemo } from "react";
import { Module, PermissionData } from "./types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { PermissionItem } from "./PermissionItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndeterminateCheckbox } from "./IndeterminateCheckbox";
import { cn } from "@/lib/utils";

interface ModuleCollapsibleProps {
  module: Module;
  selectedPermissions: string[];
  onPermissionToggle: (permissionId: string) => void;
  onModuleToggle: (modulePermissions: PermissionData[]) => void;
  toggleOpen: (moduleName: string) => void;
}

export const ModuleCollapsible = ({
  module,
  selectedPermissions,
  onPermissionToggle,
  onModuleToggle,
  toggleOpen,
}: ModuleCollapsibleProps) => {
  const modulePermissionsIds = useMemo(
    () => module.permissions.map((permission) => permission.id),
    [module.permissions]
  );

  const selectedModulePermissionsCount = useMemo(
    () => modulePermissionsIds.filter((id) => selectedPermissions.includes(id)).length,
    [modulePermissionsIds, selectedPermissions]
  );

  const isModuleChecked = selectedModulePermissionsCount === modulePermissionsIds.length && modulePermissionsIds.length > 0;
  const isModuleIndeterminate = selectedModulePermissionsCount > 0 && selectedModulePermissionsCount < modulePermissionsIds.length;

  const handleModuleToggle = () => {
    onModuleToggle(module.permissions);
  };

  const getModuleDisplayName = () => {
    if (module.displayName) return module.displayName;
    // If no display name is provided, capitalize first letter of module name
    return module.name.charAt(0).toUpperCase() + module.name.slice(1);
  };

  return (
    <Card className="overflow-hidden">
      <Collapsible open={module.isOpen} onOpenChange={() => toggleOpen(module.name)}>
        <CardHeader className="p-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndeterminateCheckbox
                checked={isModuleChecked}
                indeterminate={isModuleIndeterminate}
                onCheckedChange={handleModuleToggle}
                className={cn(
                  "data-[state=indeterminate]:bg-primary/50 data-[state=indeterminate]:text-primary-foreground"
                )}
              />
              <CardTitle className="text-base">{getModuleDisplayName()}</CardTitle>
            </div>
            
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-7 w-7">
                <ChevronRight className={`h-4 w-4 transition-transform ${module.isOpen ? "rotate-90" : ""}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="p-3 pt-0 grid gap-1.5">
            {module.permissions.length > 0 ? (
              module.permissions.map((permission) => (
                <PermissionItem
                  key={permission.id}
                  permission={permission}
                  isChecked={selectedPermissions.includes(permission.id)}
                  onToggle={onPermissionToggle}
                />
              ))
            ) : (
              <div className="text-sm text-muted-foreground p-1">
                لا توجد صلاحيات محددة في هذه المجموعة
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
