
import React, { useState } from "react";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { useOrganizationalUnitEmployees } from "@/hooks/hr/useOrganizationalUnitEmployees";
import { Button } from "@/components/ui/button";
import { Plus, Trash, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmployeeAssignDialog } from "./EmployeeAssignDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface OrganizationalUnitEmployeesProps {
  unitId: string;
}

export function OrganizationalUnitEmployees({ unitId }: OrganizationalUnitEmployeesProps) {
  const { data: unitEmployees, isLoading, refetch } = useOrganizationalUnitEmployees(unitId);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleRemoveEmployee = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('employee_organizational_units')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      
      toast({
        title: "تم إزالة الموظف",
        description: "تم إزالة الموظف من الوحدة التنظيمية بنجاح"
      });
      
      refetch();
    } catch (error) {
      console.error("Error removing employee:", error);
      toast({
        title: "حدث خطأ",
        description: "حدث خطأ أثناء إزالة الموظف من الوحدة التنظيمية",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">الموظفين في هذه الوحدة</h3>
        <Button size="sm" onClick={() => setIsAssignDialogOpen(true)}>
          <UserPlus className="ml-2 h-4 w-4" />
          إضافة موظف
        </Button>
      </div>

      {unitEmployees && unitEmployees.length > 0 ? (
        <div className="space-y-2">
          {unitEmployees.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center space-x-4 space-x-reverse">
                <Avatar>
                  <AvatarFallback>
                    {assignment.employee.full_name?.charAt(0) || "E"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{assignment.employee.full_name}</p>
                  <p className="text-sm text-muted-foreground">{assignment.employee.position || "موظف"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {assignment.is_primary && (
                  <Badge variant="secondary">أساسي</Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleRemoveEmployee(assignment.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 border border-dashed rounded-md">
          <p className="text-muted-foreground">لا يوجد موظفين في هذه الوحدة</p>
          <Button 
            variant="outline" 
            className="mt-2" 
            size="sm"
            onClick={() => setIsAssignDialogOpen(true)}
          >
            <UserPlus className="ml-2 h-4 w-4" />
            إضافة موظف
          </Button>
        </div>
      )}

      <EmployeeAssignDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        unitId={unitId}
        onSuccess={() => {
          refetch();
          setIsAssignDialogOpen(false);
        }}
        existingEmployeeIds={unitEmployees?.map(assignment => assignment.employee_id) || []}
      />
    </div>
  );
}
