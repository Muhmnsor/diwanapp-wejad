
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Role } from "../types";

export const useRoleManagement = () => {
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("roles");

  const { data: roles = [], refetch: refetchRoles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }
      
      return data as Role[];
    }
  });

  const handleAddRole = () => {
    setIsAddDialogOpen(true);
  };

  const handleRoleSaved = () => {
    toast.success("تم حفظ الدور بنجاح");
    refetchRoles();
    setRoleToEdit(null);
    setIsAddDialogOpen(false);
  };

  const handleRoleDeleted = () => {
    toast.success("تم حذف الدور بنجاح");
    refetchRoles();
    setRoleToDelete(null);
    if (selectedRoleId === roleToDelete?.id) {
      setSelectedRoleId(null);
      setActiveTab("roles");
    }
  };

  // التبديل إلى تبويب الصلاحيات عند اختيار دور
  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    if (roleId) {
      setActiveTab("permissions");
    }
  };

  return {
    roles,
    isLoading,
    roleToEdit,
    setRoleToEdit,
    roleToDelete,
    setRoleToDelete,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedRoleId,
    setSelectedRoleId,
    activeTab,
    setActiveTab,
    handleAddRole,
    handleRoleSaved,
    handleRoleDeleted,
    handleSelectRole,
    refetchRoles
  };
};
