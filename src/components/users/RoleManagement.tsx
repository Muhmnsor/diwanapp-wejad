
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleDialog } from "./RoleDialog";
import { RoleDeleteDialog } from "./RoleDeleteDialog";
import { RolePermissions } from "./RolePermissions";
import { Role } from "./types";

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
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">إدارة الأدوار</CardTitle>
          <CardDescription>
            إضافة وتعديل أدوار المستخدمين في النظام
          </CardDescription>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-1">
          <Plus className="h-4 w-4" />
          إضافة دور جديد
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="roles">
          <TabsList>
            <TabsTrigger value="roles">قائمة الأدوار</TabsTrigger>
            <TabsTrigger value="permissions" disabled={!selectedRoleId}>
              صلاحيات الدور
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roles">
            {isLoading ? (
              <div className="py-6 text-center text-muted-foreground">جاري تحميل الأدوار...</div>
            ) : roles.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">لا توجد أدوار محددة</div>
            ) : (
              <div className="space-y-4 mt-4">
                {roles.map((role) => (
                  <div 
                    key={role.id} 
                    className={`flex items-center justify-between border-b border-border pb-3 ${
                      selectedRoleId === role.id ? "bg-accent/30 p-2 rounded-md" : ""
                    }`}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{role.name}</h3>
                      <p className="text-sm text-muted-foreground">{role.description || "لا يوجد وصف"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedRoleId(role.id)}
                        className="h-8 gap-1"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        الصلاحيات
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setRoleToEdit(role)}
                        className="h-8 px-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setRoleToDelete(role)}
                        className="h-8 px-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="permissions">
            {selectedRole ? (
              <div className="mt-4">
                <RolePermissions role={selectedRole} />
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                الرجاء اختيار دور لعرض وتعديل الصلاحيات
              </div>
            )}
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
