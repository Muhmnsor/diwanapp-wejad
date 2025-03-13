
import { useState } from "react";
import { Module, Category, PERMISSION_CATEGORIES } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  isReadOnly = false,
}: ModuleCollapsibleProps) => {
  const [hover, setHover] = useState(false);

  // تحديد ما إذا كانت كل الصلاحيات في الفئة محددة
  const isCategoryAllSelected = (category: Category) => {
    return category.permissions.every((permission) => 
      selectedPermissions[permission.id]
    );
  };

  // تحديد ما إذا كانت بعض الصلاحيات في الفئة محددة (وليس كلها)
  const isCategoryPartiallySelected = (category: Category) => {
    const selected = category.permissions.some((permission) => 
      selectedPermissions[permission.id]
    );
    return selected && !isCategoryAllSelected(category);
  };

  // تبديل حالة جميع الصلاحيات في فئة معينة
  const handleCategoryToggle = (category: Category) => {
    if (isReadOnly) return;
    
    const isAllSelected = isCategoryAllSelected(category);
    category.permissions.forEach((permission) => {
      if (selectedPermissions[permission.id] === isAllSelected) {
        onPermissionToggle(permission.id);
      }
    });
  };

  return (
    <Card
      className={`mb-2 overflow-hidden border transition-colors ${
        hover ? "border-primary/50" : ""
      } ${module.isOpen ? "border-primary/50" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`flex items-center justify-between p-4 cursor-pointer ${
          module.isOpen ? "bg-muted/50" : ""
        }`}
        onClick={() => toggleOpen(module.name)}
      >
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <h3 className="text-lg font-semibold">{module.displayName || module.name}</h3>
          </div>
          {module.description && (
            <p className="text-sm text-muted-foreground">{module.description}</p>
          )}
        </div>

        <div className="flex items-center">
          {!isReadOnly && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4 mr-4">
              <Switch
                checked={module.isAllSelected}
                onCheckedChange={() => onModuleToggle(module.name)}
                disabled={isReadOnly}
              />
              <span className="text-sm">
                {module.isAllSelected ? "تحديد الكل" : "تحديد الكل"}
              </span>
            </div>
          )}
          {module.isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </div>

      {module.isOpen && (
        <CardContent className="p-4 pt-0">
          <Separator className="my-4" />
          
          {module.categories && module.categories.length > 0 ? (
            <div className="space-y-6">
              {module.categories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div 
                    className="flex items-center cursor-pointer" 
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {!isReadOnly && (
                      <Checkbox 
                        className="ml-2"
                        checked={isCategoryAllSelected(category)}
                        disabled={isReadOnly}
                        // Handle indeterminate state for checkboxes, not buttons
                        ref={(input) => {
                          if (input) {
                            // Use type assertion to help TypeScript recognize this is a checkbox input
                            const checkboxElement = input as unknown as HTMLInputElement;
                            checkboxElement.indeterminate = isCategoryPartiallySelected(category);
                          }
                        }}
                      />
                    )}
                    <h4 className="font-medium text-sm">{category.displayName}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                    {category.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-muted"
                      >
                        <div className="flex items-center">
                          <span className="text-sm">
                            {permission.display_name || permission.name}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">اسم الصلاحية: {permission.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Switch
                          checked={selectedPermissions[permission.id] || false}
                          onCheckedChange={() => {
                            if (!isReadOnly) {
                              onPermissionToggle(permission.id);
                            }
                          }}
                          disabled={isReadOnly}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {module.permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-muted"
                >
                  <div className="flex items-center">
                    <span className="text-sm">
                      {permission.display_name || permission.name}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">اسم الصلاحية: {permission.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Switch
                    checked={selectedPermissions[permission.id] || false}
                    onCheckedChange={() => {
                      if (!isReadOnly) {
                        onPermissionToggle(permission.id);
                      }
                    }}
                    disabled={isReadOnly}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
