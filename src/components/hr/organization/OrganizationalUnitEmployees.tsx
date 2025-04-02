
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOrganizationalUnitEmployees } from "@/hooks/hr/useOrganizationalUnitEmployees";
import { useEmployees } from "@/hooks/hr/useEmployees";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, Plus, UserPlus, X } from "lucide-react";

interface OrganizationalUnitEmployeesProps {
  unitId: string;
}

export function OrganizationalUnitEmployees({ unitId }: OrganizationalUnitEmployeesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: assignments, isLoading, refetch } = useOrganizationalUnitEmployees(unitId);
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees();
  
  const handleAddEmployee = async () => {
    if (!selectedEmployeeId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار موظف",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('employee_organizational_units')
        .insert([{
          employee_id: selectedEmployeeId,
          organizational_unit_id: unitId,
          role,
          is_primary: isPrimary
        }]);
        
      if (error) throw error;
      
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الموظف إلى الوحدة التنظيمية",
      });
      
      // Reset form and close dialog
      setSelectedEmployeeId("");
      setRole("");
      setIsPrimary(false);
      setIsDialogOpen(false);
      
      // Refresh the data
      refetch();
    } catch (error) {
      console.error("Error adding employee to unit:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الموظف",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveEmployee = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('employee_organizational_units')
        .delete()
        .eq('id', assignmentId);
        
      if (error) throw error;
      
      toast({
        title: "تم بنجاح",
        description: "تم إزالة الموظف من الوحدة التنظيمية",
      });
      
      // Refresh the data
      refetch();
    } catch (error) {
      console.error("Error removing employee from unit:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إزالة الموظف",
        variant: "destructive",
      });
    }
  };
  
  // Filter out employees already assigned to this unit
  const availableEmployees = employees?.filter(employee => 
    !assignments?.some(assignment => assignment.employee_id === employee.id)
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">الموظفون في هذه الوحدة</h3>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          variant="outline"
          className="flex items-center gap-1"
        >
          <UserPlus className="h-4 w-4" />
          <span>إضافة موظف</span>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      ) : assignments?.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>المنصب</TableHead>
              <TableHead>الدور في الوحدة</TableHead>
              <TableHead>أساسي</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  {assignment.employee.full_name}
                </TableCell>
                <TableCell>{assignment.employee.position || "-"}</TableCell>
                <TableCell>{assignment.role || "-"}</TableCell>
                <TableCell>
                  {assignment.is_primary && <CheckCircle className="h-4 w-4 text-green-500" />}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveEmployee(assignment.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <p>لا يوجد موظفون في هذه الوحدة بعد</p>
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة موظف إلى الوحدة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employee" className="text-right">
                الموظف
              </Label>
              <Select 
                value={selectedEmployeeId} 
                onValueChange={setSelectedEmployeeId}
                disabled={isLoadingEmployees}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر موظف" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees?.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                الدور
              </Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="col-span-3"
                placeholder="مدير / مشرف / موظف"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is-primary" className="text-right">
                أساسي
              </Label>
              <div className="col-span-3 flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="is-primary" 
                  checked={isPrimary}
                  onCheckedChange={(checked) => setIsPrimary(!!checked)}
                />
                <label
                  htmlFor="is-primary"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  هذه هي الوحدة الأساسية للموظف
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddEmployee} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التنفيذ...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  إضافة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
