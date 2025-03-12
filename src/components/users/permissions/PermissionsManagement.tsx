
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RolePermissionsView } from "./RolePermissionsView";
import { Role } from "../types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const PermissionsManagement = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  const { data: roles = [], isLoading } = useQuery({
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

  // If there are roles, select the first one by default
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const selectedRole = roles.find(role => role.id === selectedRoleId);

  return (
    <Card className="shadow-sm" dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">إدارة الصلاحيات</CardTitle>
        <CardDescription>
          تعيين صلاحيات للأدوار المختلفة في النظام
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center p-8">جاري التحميل...</div>
        ) : (
          <div className="space-y-6">
            <div className="w-full md:w-64">
              <label htmlFor="role-select" className="block text-sm font-medium mb-2">
                اختر الدور لإدارة صلاحياته
              </label>
              <Select value={selectedRoleId || ''} onValueChange={setSelectedRoleId}>
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="اختر الدور..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRole ? (
              <RolePermissionsView role={selectedRole} />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4 ml-2" />
                <AlertDescription>
                  يرجى اختيار دور لعرض وتعديل الصلاحيات
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
