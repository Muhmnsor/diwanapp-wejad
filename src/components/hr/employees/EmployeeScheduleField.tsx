
import { useEffect, useState, useCallback, useRef } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEmployeeSchedule } from "@/hooks/hr/useEmployeeSchedule";

interface EmployeeScheduleFieldProps {
  employeeId?: string;
  scheduleId: string | null;
  onScheduleChange: (scheduleId: string) => void;
  isReadOnly?: boolean;
}

export function EmployeeScheduleField({
  employeeId,
  scheduleId,
  onScheduleChange,
  isReadOnly = false,
}: EmployeeScheduleFieldProps) {
  const { schedules, defaultSchedule, isLoadingSchedules } = useEmployeeSchedule();
  const [selectedSchedule, setSelectedSchedule] = useState<string>(scheduleId || "");
  const initializedRef = useRef(false);

  // Log for debugging
  console.log("EmployeeScheduleField - Render with:", { 
    employeeId, 
    scheduleId, 
    isReadOnly,
    selectedSchedule,
    defaultScheduleId: defaultSchedule?.id,
    schedulesLoaded: schedules?.length
  });

  // Handle scheduleId changes from parent
  useEffect(() => {
    if (scheduleId !== null && scheduleId !== undefined && scheduleId !== selectedSchedule) {
      console.log("EmployeeScheduleField - External scheduleId changed to:", scheduleId);
      setSelectedSchedule(scheduleId);
    }
  }, [scheduleId, selectedSchedule]);

  // Initialize with default if needed
  useEffect(() => {
    if (initializedRef.current) return;
    
    // If we have schedules loaded and there's no selected schedule yet
    if (schedules?.length && !selectedSchedule && !scheduleId) {
      if (defaultSchedule?.id) {
        console.log("EmployeeScheduleField - Setting default schedule:", defaultSchedule.id);
        setSelectedSchedule(defaultSchedule.id);
        onScheduleChange(defaultSchedule.id);
        initializedRef.current = true;
      }
    } else if (scheduleId) {
      // Mark as initialized if we already have a scheduleId
      initializedRef.current = true;
    }
  }, [schedules, defaultSchedule, selectedSchedule, scheduleId, onScheduleChange]);

  const handleScheduleChange = useCallback((value: string) => {
    console.log("EmployeeScheduleField - Schedule changed to:", value);
    setSelectedSchedule(value);
    onScheduleChange(value);
  }, [onScheduleChange]);

  // Find the current schedule in the list
  const currentSchedule = schedules?.find(s => s.id === selectedSchedule);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor="scheduleSelect" className="text-right">جدول العمل</Label>
        {currentSchedule && (
          <Badge variant="outline" className="mr-auto ml-2">
            {currentSchedule.work_hours_per_day} ساعة / {currentSchedule.work_days_per_week} أيام
          </Badge>
        )}
      </div>
      
      <Select
        value={selectedSchedule}
        onValueChange={handleScheduleChange}
        disabled={isReadOnly || isLoadingSchedules}
      >
        <SelectTrigger id="scheduleSelect" className="text-right">
          <SelectValue placeholder={isLoadingSchedules ? "جاري التحميل..." : "اختر جدول العمل"} />
        </SelectTrigger>
        <SelectContent>
          {schedules?.map((schedule) => (
            <SelectItem key={schedule.id} value={schedule.id}>
              {schedule.name} {schedule.is_default && "(افتراضي)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {!selectedSchedule && !isLoadingSchedules && (
        <p className="text-xs text-muted-foreground text-right">
          سيتم استخدام الجدول الافتراضي إذا لم يتم اختيار جدول.
        </p>
      )}
    </div>
  );
}
