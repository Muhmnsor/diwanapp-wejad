
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
import { useQueryClient } from "@tanstack/react-query";
import { useEmployeeSchedule } from "@/hooks/hr/useEmployeeSchedule";

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
  const { schedules, defaultSchedule } = useEmployeeSchedule();

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

  const handleScheduleChange = (value: string) => {
    setScheduleId(value);
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
            <div className="space-y-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="schedule" className="text-right col-span-1">
                  جدول العمل
                </label>
                <select
                  id="schedule"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={scheduleId}
                  onChange={(e) => handleScheduleChange(e.target.value)}
                >
                  <option value="">اختر جدول العمل</option>
                  {schedules?.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.name} {schedule.is_default && "(افتراضي)"}
                    </option>
                  ))}
                </select>
              </div>
              
              {!scheduleId && !isLoading && (
                <p className="text-xs text-muted-foreground pr-4">
                  سيتم استخدام الجدول الافتراضي إذا لم يتم اختيار جدول.
                </p>
              )}
            </div>
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
