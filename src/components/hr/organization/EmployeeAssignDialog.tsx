
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { Input } from "@/components/ui/input";

interface EmployeeAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  onSuccess: () => void;
  existingEmployeeIds: string[];
}

export function EmployeeAssignDialog({ 
  open, 
  onOpenChange, 
  unitId,
  onSuccess,
  existingEmployeeIds
}: EmployeeAssignDialogProps) {
  const { data: allEmployees, isLoading: isLoadingEmployees } = useEmployees();
  const [employeeId, setEmployeeId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Filter out already assigned employees
  const availableEmployees = allEmployees?.filter(
    employee => !existingEmployeeIds.includes(employee.id)
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار موظف",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('employee_organizational_units')
        .insert({
          employee_id: employeeId,
          organizational_unit_id: unitId,
          role,
          is_primary: isPrimary,
          start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null
        });

      if (error) throw error;

      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة الموظف إلى الوحدة التنظيمية بنجاح"
      });

      onSuccess();
    } catch (error) {
      console.error("Error assigning employee:", error);
      toast({
        title: "حدث خطأ",
        description: "حدث خطأ أثناء إضافة الموظف إلى الوحدة التنظيمية",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            إضافة موظف إلى الوحدة التنظيمية
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee-id">الموظف</Label>
            <Select value={employeeId} onValueChange={setEmployeeId} required>
              <SelectTrigger id="employee-id">
                <SelectValue placeholder="اختر موظف" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingEmployees ? (
                  <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
                ) : availableEmployees.length > 0 ? (
                  availableEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-employees" disabled>لا يوجد موظفين متاحين</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">المسمى الوظيفي في الوحدة</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="أدخل المسمى الوظيفي (اختياري)"
            />
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox 
              id="is-primary" 
              checked={isPrimary} 
              onCheckedChange={(checked) => setIsPrimary(checked === true)}
            />
            <Label htmlFor="is-primary" className="text-sm font-normal">
              هذه هي الوحدة الأساسية للموظف
            </Label>
          </div>
          
          <div className="space-y-2">
            <Label>تاريخ البدء</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {startDate ? format(startDate, 'yyyy/MM/dd') : "اختر تاريخ البدء"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>تاريخ الانتهاء (اختياري)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {endDate ? format(endDate, 'yyyy/MM/dd') : "اختر تاريخ الانتهاء"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => startDate ? date < startDate : false}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading || !employeeId}>
              {isLoading ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
