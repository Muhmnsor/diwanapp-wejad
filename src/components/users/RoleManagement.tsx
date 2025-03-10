
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Save, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DeveloperPermissionChecks } from './permissions/types';

export interface RoleManagementProps {
  userId: string;
  initialPermissions: DeveloperPermissionChecks;
  onPermissionsUpdate: (permissions: DeveloperPermissionChecks) => void;
}

export const RoleManagement = ({ userId, initialPermissions, onPermissionsUpdate }: RoleManagementProps) => {
  const [permissions, setPermissions] = useState<DeveloperPermissionChecks>(initialPermissions);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPermissions(initialPermissions);
  }, [initialPermissions]);

  const handleTogglePermission = (key: keyof DeveloperPermissionChecks) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePermissions = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('developer_permissions')
        .update({
          can_access_developer_tools: permissions.canAccessDeveloperTools,
          can_modify_system_settings: permissions.canModifySystemSettings,
          can_access_api_logs: permissions.canAccessApiLogs,
          can_manage_developer_settings: permissions.canManageDeveloperSettings,
          can_view_performance_metrics: permissions.canViewPerformanceMetrics,
          can_debug_queries: permissions.canDebugQueries,
          can_manage_realtime: permissions.canManageRealtime,
          can_access_admin_panel: permissions.canAccessAdminPanel,
          can_export_data: permissions.canExportData,
          can_import_data: permissions.canImportData
        })
        .eq('user_id', userId);

      if (error) throw error;

      onPermissionsUpdate(permissions);
      toast.success('تم حفظ الصلاحيات بنجاح');
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('حدث خطأ أثناء حفظ الصلاحيات');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          إدارة صلاحيات المطور
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">الوصول إلى أدوات المطور</p>
                <p className="text-sm text-muted-foreground">السماح بعرض وإدارة أدوات المطور</p>
              </div>
              <Switch 
                checked={permissions.canAccessDeveloperTools}
                onCheckedChange={() => handleTogglePermission('canAccessDeveloperTools')}
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">تعديل إعدادات النظام</p>
                <p className="text-sm text-muted-foreground">السماح بتعديل الإعدادات الأساسية</p>
              </div>
              <Switch 
                checked={permissions.canModifySystemSettings}
                onCheckedChange={() => handleTogglePermission('canModifySystemSettings')}
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">الوصول إلى سجلات API</p>
                <p className="text-sm text-muted-foreground">السماح بعرض وتحليل سجلات API</p>
              </div>
              <Switch 
                checked={permissions.canAccessApiLogs}
                onCheckedChange={() => handleTogglePermission('canAccessApiLogs')}
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">إدارة إعدادات المطور</p>
                <p className="text-sm text-muted-foreground">السماح بتعديل إعدادات المطور</p>
              </div>
              <Switch 
                checked={permissions.canManageDeveloperSettings}
                onCheckedChange={() => handleTogglePermission('canManageDeveloperSettings')}
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">عرض قياسات الأداء</p>
                <p className="text-sm text-muted-foreground">السماح بعرض وتحليل قياسات أداء التطبيق</p>
              </div>
              <Switch 
                checked={permissions.canViewPerformanceMetrics}
                onCheckedChange={() => handleTogglePermission('canViewPerformanceMetrics')}
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">تصحيح الاستعلامات</p>
                <p className="text-sm text-muted-foreground">السماح بمراقبة وتصحيح استعلامات قواعد البيانات</p>
              </div>
              <Switch 
                checked={permissions.canDebugQueries}
                onCheckedChange={() => handleTogglePermission('canDebugQueries')}
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">إدارة التحديثات المباشرة</p>
                <p className="text-sm text-muted-foreground">السماح بإدارة إعدادات التحديثات المباشرة</p>
              </div>
              <Switch 
                checked={permissions.canManageRealtime}
                onCheckedChange={() => handleTogglePermission('canManageRealtime')}
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">الوصول إلى لوحة الإدارة</p>
                <p className="text-sm text-muted-foreground">السماح بالوصول إلى لوحة إدارة المطور</p>
              </div>
              <Switch 
                checked={permissions.canAccessAdminPanel}
                onCheckedChange={() => handleTogglePermission('canAccessAdminPanel')}
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">تصدير البيانات</p>
                <p className="text-sm text-muted-foreground">السماح بتصدير البيانات من النظام</p>
              </div>
              <Switch 
                checked={permissions.canExportData}
                onCheckedChange={() => handleTogglePermission('canExportData')}
              />
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">استيراد البيانات</p>
                <p className="text-sm text-muted-foreground">السماح باستيراد البيانات إلى النظام</p>
              </div>
              <Switch 
                checked={permissions.canImportData}
                onCheckedChange={() => handleTogglePermission('canImportData')}
              />
            </div>
          </div>

          <Button 
            className="w-full mt-4" 
            onClick={handleSavePermissions}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جارٍ الحفظ...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                حفظ الصلاحيات
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
