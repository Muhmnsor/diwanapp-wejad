
import { useEffect, useState } from "react";
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
  scheduleId: string;
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
  const [selectedSchedule, setSelectedSchedule] = useState(scheduleId || "");

  console.log("EmployeeScheduleField - Initial props:", { employeeId, scheduleId, isReadOnly });
  console.log("EmployeeScheduleField - Available schedules:", schedules);
  console.log("EmployeeScheduleField - Default schedule:", defaultSchedule);

  useEffect(() => {
    console.log("EmployeeScheduleField - Effect triggered with scheduleId:", scheduleId);
    
    // If scheduleId is empty and we have a default schedule, set it
    if ((!scheduleId || scheduleId === "") && defaultSchedule?.id && !selectedSchedule) {
      console.log("EmployeeScheduleField - Setting default schedule:", defaultSchedule.id);
      setSelectedSchedule(defaultSchedule.id);
      onScheduleChange(defaultSchedule.id);
    } else if (scheduleId !== selectedSchedule && scheduleId) {
      console.log("EmployeeScheduleField - Updating selected schedule from props:", scheduleId);
      setSelectedSchedule(scheduleId);
    }
  }, [scheduleId, defaultSchedule, selectedSchedule, onScheduleChange]);

  const handleScheduleChange = (value: string) => {
    console.log("EmployeeScheduleField - Schedule changed to:", value);
    setSelectedSchedule(value);
    onScheduleChange(value);
  };

  const currentSchedule = schedules?.find(s => s.id === selectedSchedule);
  console.log("EmployeeScheduleField - Current schedule:", currentSchedule);

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor="scheduleSelect">جدول العمل</Label>
        {currentSchedule && (
          <Badge variant="outline" className="mr-2">
            {currentSchedule.work_hours_per_day} ساعة / {currentSchedule.work_days_per_week} أيام
          </Badge>
        )}
      </div>
      
      <Select
        value={selectedSchedule}
        onValueChange={handleScheduleChange}
        disabled={isReadOnly || isLoadingSchedules}
      >
        <SelectTrigger id="scheduleSelect">
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
        <p className="text-xs text-muted-foreground">
          سيتم استخدام الجدول الافتراضي إذا لم يتم اختيار جدول.
        </p>
      )}
    </div>
  );
}
