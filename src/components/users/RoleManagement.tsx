
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleDialog } from "./RoleDialog";
import { RoleDeleteDialog } from "./RoleDeleteDialog";
import { Role } from "./types";
import { RolesTabContent } from "./roles/RolesTabContent";
import { PermissionsTabContent } from "./roles/PermissionsTabContent";

export const RoleManagement = () => {
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

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
    }
  };

  // العثور على الدور المحدد حاليا من قائمة الأدوار
  const selectedRole = roles.find(role => role.id === selectedRoleId);

  return (
    <Card className="shadow-sm" dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">إدارة الأدوار</CardTitle>
        <CardDescription>
          إضافة وتعديل أدوار المستخدمين في النظام
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="roles" dir="rtl">
          <TabsList>
            <TabsTrigger value="roles">قائمة الأدوار</TabsTrigger>
            <TabsTrigger value="permissions" disabled={!selectedRoleId}>
              صلاحيات الدور
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roles">
            <RolesTabContent 
              roles={roles}
              isLoading={isLoading}
              selectedRoleId={selectedRoleId}
              onAddRole={() => setIsAddDialogOpen(true)}
              onSelectRole={setSelectedRoleId}
              onEditRole={setRoleToEdit}
              onDeleteRole={setRoleToDelete}
            />
          </TabsContent>
          
          <TabsContent value="permissions">
            <PermissionsTabContent selectedRole={selectedRole} />
          </TabsContent>
        </Tabs>
      </CardContent>

      <RoleDialog 
        isOpen={isAddDialogOpen || !!roleToEdit}
        onClose={() => {
          setIsAddDialogOpen(false);
          setRoleToEdit(null);
        }}
        role={roleToEdit}
        onSave={handleRoleSaved}
      />

      <RoleDeleteDialog
        role={roleToDelete}
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onDelete={handleRoleDeleted}
      />
    </Card>
  );
};
