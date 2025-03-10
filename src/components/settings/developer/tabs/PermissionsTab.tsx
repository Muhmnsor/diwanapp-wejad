
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Shield, Users } from "lucide-react";
import { DeveloperPermissionChecks } from "@/components/users/permissions/types";

interface PermissionsTabProps {
  permissions: DeveloperPermissionChecks;
  hasDeveloperAccess: boolean;
  onToggleDeveloperRole: () => Promise<void>;
  roleAssigning: boolean;
  onRefresh: () => Promise<void>;
}

export const PermissionsTab = ({ 
  permissions, 
  hasDeveloperAccess,
  onToggleDeveloperRole,
  roleAssigning,
  onRefresh
}: PermissionsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>صلاحيات المطور</CardTitle>
        <CardDescription>إدارة صلاحيات الوصول إلى أدوات المطور</CardDescription>
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
              ? " أنت تمتلك حالياً صلاحيات المطور." 
              : " أنت لا تمتلك حالياً صلاحيات المطور."}
          </p>
          <Button
            className="w-full"
            variant={hasDeveloperAccess ? "destructive" : "default"}
            onClick={onToggleDeveloperRole}
            disabled={roleAssigning}
          >
            {roleAssigning ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 ml-2" />
                {hasDeveloperAccess ? "إزالة دور المطور" : "تعيين دور المطور"}
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
        </div>
        
        <Button 
          className="mt-4 w-full" 
          variant="outline"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث الصلاحيات
        </Button>
      </CardContent>
    </Card>
  );
};
