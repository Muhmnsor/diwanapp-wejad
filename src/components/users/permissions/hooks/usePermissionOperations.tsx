
import { useState, useCallback } from "react";
import { Module } from "../types";

export const usePermissionOperations = () => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // تبديل إذن معين
  const handlePermissionToggle = useCallback((permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  }, []);

  // تبديل كل أذونات الوحدة
  const handleModuleToggle = useCallback((module: Module) => {
    const modulePermissionIds = module.permissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // إزالة كل أذونات الوحدة
      setSelectedPermissions(prev => 
        prev.filter(id => !modulePermissionIds.includes(id))
      );
    } else {
      // إضافة كل أذونات الوحدة غير المحددة
      const missingPermissions = modulePermissionIds.filter(
        id => !selectedPermissions.includes(id)
      );
      setSelectedPermissions(prev => [...prev, ...missingPermissions]);
    }
  }, [selectedPermissions]);

  // تبديل حالة فتح/إغلاق وحدة
  const toggleModuleOpen = useCallback((moduleName: string) => {
    console.log(`تبديل حالة الوحدة: ${moduleName}`);
    // تم نقل المنطق إلى المكون الرئيسي
  }, []);

  return {
    selectedPermissions,
    setSelectedPermissions,
    handlePermissionToggle,
    handleModuleToggle,
    toggleModuleOpen
  };
};
