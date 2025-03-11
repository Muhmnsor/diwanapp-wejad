
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ChevronUp, ChevronDown, CheckCircle, XCircle } from "lucide-react";
import { ModuleCollapsible } from "./ModuleCollapsible";
import { Role } from "../types";
import { usePermissions } from "./usePermissions";

interface RolePermissionsViewProps {
  role: Role;
}

export const RolePermissionsView = ({ role }: RolePermissionsViewProps) => {
  const {
    modules,
    selectedPermissions,
    isLoading,
    isSubmitting,
    searchQuery,
    handleSearch,
    handlePermissionToggle,
    handleModuleToggle,
    toggleModuleOpen,
    toggleAllModules,
    selectAllPermissions,
    deselectAllPermissions,
    handleSave
  } = usePermissions(role);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل الصلاحيات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">صلاحيات الدور: {role.name}</h2>
        <Button 
          onClick={handleSave} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : 'حفظ الصلاحيات'}
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن صلاحية..."
            className="pr-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => toggleAllModules(true)}
        >
          <ChevronDown className="h-4 w-4 ml-1" />
          توسيع الكل
        </Button>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => toggleAllModules(false)}
        >
          <ChevronUp className="h-4 w-4 ml-1" />
          طي الكل
        </Button>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={selectAllPermissions}
        >
          <CheckCircle className="h-4 w-4 ml-1" />
          تحديد الكل
        </Button>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={deselectAllPermissions}
        >
          <XCircle className="h-4 w-4 ml-1" />
          إلغاء تحديد الكل
        </Button>
      </div>

      <div className="space-y-2">
        {modules.map((module) => (
          <ModuleCollapsible
            key={module.name}
            module={module}
            selectedPermissions={selectedPermissions}
            onPermissionToggle={handlePermissionToggle}
            onModuleToggle={handleModuleToggle}
            toggleOpen={toggleModuleOpen}
          />
        ))}
      </div>

      {modules.length === 0 && (
        <div className="text-center p-8 border rounded-md bg-muted">
          {searchQuery ? 
            'لا توجد نتائج للبحث' : 
            'لا توجد صلاحيات متاحة لهذا الدور'
          }
        </div>
      )}
    </div>
  );
};
