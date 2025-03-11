
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Module, PermissionData } from "./types";
import { Role } from "../types";
import { fetchPermissions, fetchRolePermissions, saveRolePermissions } from "./api/permissionsApi";
import { organizePermissionsByModule } from "./utils/permissionsUtils";
import { usePermissionOperations } from "./hooks/usePermissionOperations";

export const usePermissions = (role: Role) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Query for fetching all permissions
  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: fetchPermissions
  });

  // Query for fetching role permissions
  const { data: rolePermissions = [], refetch: refetchRolePermissions } = useQuery({
    queryKey: ['role-permissions', role?.id],
    queryFn: async () => fetchRolePermissions(role?.id || ''),
    enabled: !!role?.id
  });

  // Get permission operations
  const {
    selectedPermissions,
    setSelectedPermissions,
    handlePermissionToggle,
    handleModuleToggle: handleModuleToggleBase
  } = usePermissionOperations();

  // Update selected permissions when role permissions change
  useEffect(() => {
    if (rolePermissions.length > 0) {
      setSelectedPermissions(rolePermissions);
    } else {
      setSelectedPermissions([]);
    }
  }, [rolePermissions, setSelectedPermissions]);

  // Organize permissions by module when permissions data changes
  useEffect(() => {
    if (permissions.length > 0) {
      let organizedModules = organizePermissionsByModule(permissions);
      
      // Apply search filter if query exists
      if (searchQuery) {
        const lowercaseQuery = searchQuery.toLowerCase();
        organizedModules = organizedModules.map(module => ({
          ...module,
          permissions: module.permissions.filter(permission => 
            permission.description.toLowerCase().includes(lowercaseQuery) || 
            permission.name.toLowerCase().includes(lowercaseQuery)
          ),
          isOpen: true // Auto-expand modules with matching permissions
        })).filter(module => module.permissions.length > 0);
      }
      
      setModules(organizedModules);
    }
  }, [permissions, searchQuery]);

  // Wrapper for handleModuleToggle that passes modules
  const handleModuleToggle = (moduleName: string) => {
    handleModuleToggleBase(moduleName, modules);
  };

  // Toggle module open/closed state
  const toggleModuleOpen = (moduleName: string) => {
    setModules(prev => prev.map(m => 
      m.name === moduleName ? { ...m, isOpen: !m.isOpen } : m
    ));
  };

  // Toggle all modules open or closed
  const toggleAllModules = (isOpen: boolean) => {
    setModules(prev => prev.map(m => ({ ...m, isOpen })));
  };

  // Select all permissions
  const selectAllPermissions = () => {
    const allPermissionIds = permissions.map(p => p.id);
    setSelectedPermissions(allPermissionIds);
  };

  // Deselect all permissions
  const deselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  // Filter modules and permissions by search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Save permissions
  const handleSave = async () => {
    if (!role?.id) {
      toast.error("لم يتم تحديد دور");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await saveRolePermissions(role.id, selectedPermissions);
      toast.success("تم حفظ صلاحيات الدور بنجاح");
      await refetchRolePermissions();
    } catch (error) {
      console.error('Error saving role permissions:', error);
      toast.error("حدث خطأ أثناء حفظ الصلاحيات");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    modules,
    selectedPermissions,
    isLoading,
    permissions,
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
  };
};
