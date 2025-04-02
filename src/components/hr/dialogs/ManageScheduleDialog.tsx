
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEmployeeSchedule } from "@/hooks/hr/useEmployeeSchedule";
import { EmployeeScheduleField } from "../employees/EmployeeScheduleField";
import { toast } from "sonner";

interface ManageScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  onSuccess?: () => void;
}

export function ManageScheduleDialog({ 
  isOpen, 
  onClose, 
  employee,
  onSuccess
}: ManageScheduleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleId, setScheduleId] = useState<string>(employee?.schedule_id || "");
  const { assignScheduleToEmployee } = useEmployeeSchedule();

  // Update schedule ID when employee changes
  useEffect(() => {
    if (employee) {
      setScheduleId(employee.schedule_id || "");
    }
  }, [employee]);

  const handleScheduleChange = (newScheduleId: string) => {
    setScheduleId(newScheduleId);
  };

  const handleSave = async () => {
    if (!employee?.id) {
      toast.error("بيانات الموظف غير متوفرة");
      return;
    }
    
    if (!scheduleId) {
      toast.error("يرجى اختيار جدول العمل");
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await assignScheduleToEmployee(employee.id, scheduleId);
      if (result.success) {
        toast.success("تم تحديث جدول العمل بنجاح");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error("حدث خطأ أثناء تحديث جدول العمل");
      }
    } catch (error) {
      console.error("Error assigning schedule:", error);
      toast.error("فشل في تحديث جدول العمل");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إدارة جدول العمل</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <h3 className="font-medium">الموظف: {employee?.full_name}</h3>
          </div>
          
          <EmployeeScheduleField
            employeeId={employee?.id}
            scheduleId={scheduleId}
            onScheduleChange={handleScheduleChange}
          />
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
