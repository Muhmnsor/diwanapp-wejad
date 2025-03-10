
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Shield, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from '@/store/refactored-auth';
import { assignDeveloperRole, removeDeveloperRole } from "@/utils/developerRoleIntegration";
import { initializeDeveloperRole } from '@/utils/developerRole';
import { checkDeveloperPermissions } from '@/components/users/permissions/utils/developerPermissionUtils';
import { DeveloperPermissionChecks } from '@/components/users/permissions/types';

interface RoleManagementProps {
  userId: string;
  initialPermissions: DeveloperPermissionChecks;
  onPermissionsUpdate: (permissions: DeveloperPermissionChecks) => void;
}

export const RoleManagement = ({ 
  userId, 
  initialPermissions, 
  onPermissionsUpdate 
}: RoleManagementProps) => {
  const [permissions, setPermissions] = useState<DeveloperPermissionChecks>(initialPermissions);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleToggleDeveloperRole = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const hasDeveloperTools = permissions.canAccessDeveloperTools;
      
      if (hasDeveloperTools) {
        await removeDeveloperRole(userId);
      } else {
        // First initialize the role if needed
        await initializeDeveloperRole(userId);
        // Then assign developer permissions
        await assignDeveloperRole(userId);
      }
      
      // Refresh permissions
      const updatedPermissions = await checkDeveloperPermissions(userId);
      setPermissions(updatedPermissions);
      onPermissionsUpdate(updatedPermissions);
      
      toast.success(hasDeveloperTools 
        ? "تم إزالة دور المطور بنجاح" 
        : "تم تعيين دور المطور بنجاح"
      );
    } catch (error) {
      console.error('Error toggling developer role:', error);
      toast.error("حدث خطأ أثناء تغيير دور المطور");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة الأدوار</CardTitle>
        <CardDescription>تعيين أو إزالة أدوار المستخدم</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4 p-4 border rounded-md bg-muted/40">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-medium">حالة دور المطور</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            دور المطور يمنح صلاحيات إضافية للوصول إلى أدوات وإعدادات المطور. 
            {permissions.canAccessDeveloperTools 
              ? " المستخدم يمتلك حالياً صلاحيات المطور." 
              : " المستخدم لا يمتلك حالياً صلاحيات المطور."}
          </p>
          <Button
            className="w-full"
            variant={permissions.canAccessDeveloperTools ? "destructive" : "default"}
            onClick={handleToggleDeveloperRole}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 ml-2" />
                {permissions.canAccessDeveloperTools ? "إزالة دور المطور" : "تعيين دور المطور"}
              </>
            )}
          </Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium mb-2">الصلاحيات الحالية</h3>
          
          <div className="p-2 border rounded flex items-center justify-between">
            <div>
              <p className="font-medium">الوصول إلى أدوات المطور</p>
              <p className="text-sm text-muted-foreground">السماح بعرض أدوات المطور المختلفة</p>
            </div>
            <div className={`px-2 py-1 rounded text-sm ${permissions.canAccessDeveloperTools ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {permissions.canAccessDeveloperTools ? 'مسموح' : 'غير مسموح'}
            </div>
          </div>
          
          <div className="p-2 border rounded flex items-center justify-between">
            <div>
              <p className="font-medium">تعديل إعدادات النظام</p>
              <p className="text-sm text-muted-foreground">السماح بتعديل الإعدادات الأساسية للنظام</p>
            </div>
            <div className={`px-2 py-1 rounded text-sm ${permissions.canModifySystemSettings ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {permissions.canModifySystemSettings ? 'مسموح' : 'غير مسموح'}
            </div>
          </div>
          
          <div className="p-2 border rounded flex items-center justify-between">
            <div>
              <p className="font-medium">الوصول إلى سجلات API</p>
              <p className="text-sm text-muted-foreground">السماح بعرض وتحليل سجلات طلبات API</p>
            </div>
            <div className={`px-2 py-1 rounded text-sm ${permissions.canAccessApiLogs ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {permissions.canAccessApiLogs ? 'مسموح' : 'غير مسموح'}
            </div>
          </div>
          
          <div className="p-2 border rounded flex items-center justify-between">
            <div>
              <p className="font-medium">إدارة إعدادات المطور</p>
              <p className="text-sm text-muted-foreground">السماح بتعديل إعدادات المطور</p>
            </div>
            <div className={`px-2 py-1 rounded text-sm ${permissions.canManageDeveloperSettings ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {permissions.canManageDeveloperSettings ? 'مسموح' : 'غير مسموح'}
            </div>
          </div>
          
          <div className="p-2 border rounded flex items-center justify-between">
            <div>
              <p className="font-medium">قياس الأداء</p>
              <p className="text-sm text-muted-foreground">السماح بقياس الأداء</p>
            </div>
            <div className={`px-2 py-1 rounded text-sm ${permissions.canViewPerformanceMetrics ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {permissions.canViewPerformanceMetrics ? 'مسموح' : 'غير مسموح'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
