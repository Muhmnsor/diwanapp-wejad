
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { Role } from "../types";
import { addAppPermissionToRole, removeAppPermissionFromRole, getAppPermissionsForRole, getAvailableApps } from "@/utils/app-permissions/createAppPermission";

interface ManualAppPermissionsProps {
  role: Role;
  onPermissionsChange?: () => void;
}

export const ManualAppPermissions: React.FC<ManualAppPermissionsProps> = ({ role, onPermissionsChange }) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const availableApps = getAvailableApps();
  
  // Load initial permissions
  useEffect(() => {
    const loadPermissions = async () => {
      setIsLoading(true);
      try {
        const rolePermissions = await getAppPermissionsForRole(role.id);
        setPermissions(rolePermissions);
      } catch (error) {
        console.error('Error loading app permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (role?.id) {
      loadPermissions();
    }
  }, [role.id]);
  
  const handleTogglePermission = (appName: string) => {
    setPermissions(prev => {
      if (prev.includes(appName)) {
        return prev.filter(p => p !== appName);
      } else {
        return [...prev, appName];
      }
    });
  };
  
  const handleSave = async () => {
    if (!role.id) return;
    
    setIsSaving(true);
    try {
      // Get current permissions
      const currentPermissions = await getAppPermissionsForRole(role.id);
      
      // Permissions to add (in new state but not in current)
      const permissionsToAdd = permissions.filter(p => !currentPermissions.includes(p));
      
      // Permissions to remove (in current but not in new state)
      const permissionsToRemove = currentPermissions.filter(p => !permissions.includes(p));
      
      // Add new permissions
      for (const appName of permissionsToAdd) {
        await addAppPermissionToRole(role.id, appName);
      }
      
      // Remove old permissions
      for (const appName of permissionsToRemove) {
        await removeAppPermissionFromRole(role.id, appName);
      }
      
      if (onPermissionsChange) {
        onPermissionsChange();
      }
    } catch (error) {
      console.error('Error saving app permissions:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل الصلاحيات...</span>
      </div>
    );
  }
  
  // Translation map for app names
  const appNameTranslations: Record<string, string> = {
    'hr': 'إدارة شؤون الموظفين',
    'accounting': 'إدارة المحاسبة',
    'meetings': 'إدارة الاجتماعات',
    'tasks': 'إدارة المهام',
    'documents': 'إدارة المستندات'
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>صلاحيات الوصول للتطبيقات</CardTitle>
        <CardDescription>
          حدد التطبيقات التي يمكن للدور "{role.name}" الوصول إليها
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {availableApps.map(appName => (
            <div className="flex items-center space-x-2 space-x-reverse" key={appName}>
              <Checkbox 
                id={`app-${appName}`}
                checked={permissions.includes(appName)}
                onCheckedChange={() => handleTogglePermission(appName)}
              />
              <label 
                htmlFor={`app-${appName}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mr-2"
              >
                {appNameTranslations[appName] || appName}
              </label>
            </div>
          ))}
          
          <Button 
            className="mt-4" 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : 'حفظ صلاحيات التطبيقات'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
