
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { EmployeeScheduleField } from "../employees/EmployeeScheduleField";
import { useQueryClient } from "@tanstack/react-query";

interface AssignScheduleDialogProps {
  employeeId: string | null;
  employeeName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignScheduleDialog({ 
  employeeId, 
  employeeName, 
  isOpen, 
  onClose 
}: AssignScheduleDialogProps) {
  const [scheduleId, setScheduleId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && employeeId) {
      setIsLoading(true);
      supabase
        .from("employees")
        .select("schedule_id")
        .eq("id", employeeId)
        .single()
        .then(({ data, error }) => {
          setIsLoading(false);
          if (error) {
            console.error("Error fetching employee schedule:", error);
            return;
          }
          setScheduleId(data.schedule_id || "");
        });
    } else {
      setScheduleId("");
    }
  }, [isOpen, employeeId]);

  const handleSave = async () => {
    if (!employeeId) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("employees")
        .update({ schedule_id: scheduleId })
        .eq("id", employeeId);
      
      if (error) throw error;
      
      toast.success("تم تحديث جدول العمل بنجاح");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    } catch (error) {
      console.error("Error updating employee schedule:", error);
      toast.error("حدث خطأ أثناء تحديث جدول العمل");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعيين جدول العمل</DialogTitle>
          <DialogDescription>
            {employeeName ? `تعيين جدول العمل للموظف: ${employeeName}` : 'تعيين جدول العمل للموظف'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <EmployeeScheduleField
              value={scheduleId}
              onChange={setScheduleId}
            />
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
