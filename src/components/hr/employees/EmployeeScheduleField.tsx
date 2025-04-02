
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployeeSchedule } from "@/hooks/hr/useEmployeeSchedule";

interface EmployeeScheduleFieldProps {
  employeeId: string;
  scheduleId: string;
  onScheduleChange: (value: string) => void;
}

export function EmployeeScheduleField({ 
  employeeId, 
  scheduleId, 
  onScheduleChange 
}: EmployeeScheduleFieldProps) {
  const { schedules, defaultSchedule, isLoadingSchedules } = useEmployeeSchedule();
  const [selectedValue, setSelectedValue] = useState<string>(scheduleId || "");

  // Set default schedule if no schedule is selected
  useEffect(() => {
    if ((!scheduleId || scheduleId === "") && defaultSchedule && defaultSchedule.id) {
      console.log("Setting default schedule:", defaultSchedule.id);
      setSelectedValue(defaultSchedule.id);
      onScheduleChange(defaultSchedule.id);
    } else if (scheduleId && scheduleId !== selectedValue) {
      console.log("Updating from props:", scheduleId);
      setSelectedValue(scheduleId);
    }
  }, [scheduleId, defaultSchedule, onScheduleChange, selectedValue]);

  const handleScheduleChange = (newValue: string) => {
    console.log("Schedule changed to:", newValue);
    setSelectedValue(newValue);
    onScheduleChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="schedule_id">جدول العمل</Label>
      <Select
        value={selectedValue}
        onValueChange={handleScheduleChange}
        disabled={isLoadingSchedules}
      >
        <SelectTrigger id="schedule_id">
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
      <p className="text-xs text-muted-foreground">
        جدول العمل المخصص للموظف لاحتساب الحضور والانصراف
      </p>
    </div>
  );
}
