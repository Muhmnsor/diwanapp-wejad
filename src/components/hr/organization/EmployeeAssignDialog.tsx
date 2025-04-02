
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";

interface EmployeeAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  onSuccess?: () => void;
  existingEmployeeIds: string[];
}

export function EmployeeAssignDialog({
  open,
  onOpenChange,
  unitId,
  onSuccess,
  existingEmployeeIds
}: EmployeeAssignDialogProps) {
  const { data: employees, isLoading } = useEmployees();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isPrimary, setIsPrimary] = useState(false);
  const { toast } = useToast();
  
  // Filter out employees that are already assigned to this unit
  const availableEmployees = employees?.filter(
    employee => !existingEmployeeIds.includes(employee.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployeeId) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار موظف",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('employee_organizational_units')
        .insert({
          employee_id: selectedEmployeeId,
          organizational_unit_id: unitId,
          is_primary: isPrimary
        });

      if (error) throw error;
      
      toast({
        title: "تم إضافة الموظف",
        description: "تم إضافة الموظف إلى الوحدة التنظيمية بنجاح"
      });
      
      setSelectedEmployeeId("");
      setIsPrimary(false);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error assigning employee:", error);
      toast({
        title: "حدث خطأ",
        description: "حدث خطأ أثناء إضافة الموظف إلى الوحدة التنظيمية",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة موظف إلى الوحدة التنظيمية</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">الموظف</Label>
            <Select 
              value={selectedEmployeeId} 
              onValueChange={setSelectedEmployeeId}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر موظف" />
              </SelectTrigger>
              <SelectContent>
                {availableEmployees?.length ? (
                  availableEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    {isLoading ? "جاري التحميل..." : "لا يوجد موظفين متاحين للإضافة"}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox 
              id="is-primary" 
              checked={isPrimary}
              onCheckedChange={(checked) => setIsPrimary(checked as boolean)}
            />
            <Label htmlFor="is-primary">وحدة أساسية للموظف</Label>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={!selectedEmployeeId || isLoading}>
              إضافة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
