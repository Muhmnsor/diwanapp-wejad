
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { ModuleCollapsible } from "./ModuleCollapsible";
import { Role } from "../types";
import { usePermissions } from "./usePermissions";
import { AppPermissionsManager } from "./AppPermissionsManager";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoPermissionsMessage } from "./NoPermissionsMessage";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/refactored-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RolePermissionsViewProps {
  role: Role;
}

export const RolePermissionsView = ({ role }: RolePermissionsViewProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("permissions");
  const { user } = useAuthStore();
  
  // Check if current user is admin or developer
  const isAdminOrDeveloper = user?.isAdmin || user?.role === 'developer';
  
  const {
    modules,
    selectedPermissions,
    isLoading,
    isSubmitting,
    error,
    handlePermissionToggle,
    handleModuleToggle,
    toggleModuleOpen,
    handleSave
  } = usePermissions(role);

  // Force a refresh of permissions data
  const handlePermissionsAdded = () => {
    setRefreshKey(prev => prev + 1);
    // Switch to the permissions tab after adding default permissions
    setActiveTab("permissions");
    toast.success("تم تحديث الصلاحيات، يرجى حفظ التغييرات");
  };

  const handleRefreshPermissions = () => {
    setRefreshKey(prev => prev + 1);
    toast.info("جاري تحديث الصلاحيات...");
  };

  // Listen for role changes and refresh permissions
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [role.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل الصلاحيات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 ml-2" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleRefreshPermissions}>
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">صلاحيات الدور: {role.name}</h2>
        {isAdminOrDeveloper && (
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
        )}
      </div>

      {!isAdminOrDeveloper && (
        <div className="p-3 bg-blue-50 rounded-md mb-4 text-sm">
          أنت في وضع العرض فقط. فقط المشرفون والمطورون يمكنهم تعديل صلاحيات الأدوار.
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="permissions">الصلاحيات التفصيلية</TabsTrigger>
          <TabsTrigger value="apps">وصول التطبيقات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="permissions" className="space-y-2">
          {modules.length === 0 ? (
            <NoPermissionsMessage role={role} onPermissionsAdded={handlePermissionsAdded} />
          ) : (
            modules.map((module) => (
              <ModuleCollapsible
                key={module.name}
                module={module}
                selectedPermissions={selectedPermissions}
                onPermissionToggle={handlePermissionToggle}
                onModuleToggle={handleModuleToggle}
                toggleOpen={toggleModuleOpen}
                isReadOnly={!isAdminOrDeveloper}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="apps">
          <AppPermissionsManager role={role} key={`app-permissions-${refreshKey}`} onPermissionsChange={() => setRefreshKey(prev => prev + 1)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
