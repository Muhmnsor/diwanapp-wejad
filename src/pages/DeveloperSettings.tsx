
import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { useDeveloperStore } from "@/store/developerStore";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";
import { assignDeveloperRole, removeDeveloperRole } from "@/utils/developerRoleIntegration";
import { checkDeveloperPermissions } from "@/components/users/permissions/utils/developerPermissionUtils";
import { DeveloperPermissionChecks } from "@/components/users/permissions/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SecondaryHeader } from "@/components/settings/developer/SecondaryHeader";
import { DeveloperSettingsContent } from "@/components/settings/developer/DeveloperSettingsContent";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const DeveloperSettings = () => {
  const { settings, fetchSettings } = useDeveloperStore();
  const { user } = useAuthStore();
  const [permissions, setPermissions] = useState<DeveloperPermissionChecks>({
    canAccessDeveloperTools: false,
    canModifySystemSettings: false,
    canAccessApiLogs: false
  });
  const [roleAssigning, setRoleAssigning] = useState(false);
  
  useEffect(() => {
    if (user?.id) {
      loadDeveloperPermissions(user.id);
    }
  }, [user?.id]);
  
  const loadDeveloperPermissions = async (userId: string) => {
    const permissionChecks = await checkDeveloperPermissions(userId);
    setPermissions(permissionChecks);
  };
  
  const handleRefresh = async () => {
    await fetchSettings();
    if (user?.id) {
      await loadDeveloperPermissions(user.id);
    }
    toast.success("تم تحديث الإعدادات بنجاح");
  };
  
  const handleToggleDeveloperRole = async () => {
    if (!user?.id) return;
    
    setRoleAssigning(true);
    try {
      const hasDeveloperTools = permissions.canAccessDeveloperTools;
      
      if (hasDeveloperTools) {
        await removeDeveloperRole(user.id);
      } else {
        await assignDeveloperRole(user.id);
      }
      
      await loadDeveloperPermissions(user.id);
    } catch (error) {
      console.error('Error toggling developer role:', error);
      toast.error("حدث خطأ أثناء تغيير دور المطور");
    } finally {
      setRoleAssigning(false);
    }
  };
  
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">وصول غير مصرح به</CardTitle>
              <CardDescription>
                لا تملك صلاحيات للوصول إلى صفحة إعدادات المطورين.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <SecondaryHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">إعدادات المطورين</h1>
            <p className="text-muted-foreground">إدارة إعدادات وأدوات التطوير</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
        </div>
        
        <DeveloperSettingsContent 
          permissions={permissions}
          handleToggleDeveloperRole={handleToggleDeveloperRole}
          roleAssigning={roleAssigning}
          handleRefresh={handleRefresh}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default DeveloperSettings;
