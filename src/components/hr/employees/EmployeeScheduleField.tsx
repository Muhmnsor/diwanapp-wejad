
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployeeSchedule } from "@/hooks/hr/useEmployeeSchedule";

interface EmployeeScheduleFieldProps {
  employeeId?: string;
  scheduleId?: string;
  onScheduleChange?: (value: string) => void;
  // Add support for React Hook Form pattern
  value?: string;
  onChange?: (value: string) => void;
}

export function EmployeeScheduleField({ 
  employeeId, 
  scheduleId, 
  onScheduleChange,
  value,
  onChange
}: EmployeeScheduleFieldProps) {
  const { schedules, defaultSchedule, isLoadingSchedules } = useEmployeeSchedule();
  
  // Determine which value to use (scheduleId from direct props or value from form)
  const actualValue = value !== undefined ? value : scheduleId;
  
  const [selectedValue, setSelectedValue] = useState<string>(actualValue || "");

  // Handler function that works with both prop patterns
  const handleValueChange = (newValue: string) => {
    console.log("Schedule changed to:", newValue);
    setSelectedValue(newValue);
    
    // Call the appropriate handler
    if (onChange) {
      onChange(newValue);
    } else if (onScheduleChange) {
      onScheduleChange(newValue);
    }
  };

  // Set default schedule if no schedule is selected
  useEffect(() => {
    if ((!actualValue || actualValue === "") && defaultSchedule && defaultSchedule.id) {
      console.log("Setting default schedule:", defaultSchedule.id);
      setSelectedValue(defaultSchedule.id);
      
      // Call the appropriate handler
      if (onChange) {
        onChange(defaultSchedule.id);
      } else if (onScheduleChange) {
        onScheduleChange(defaultSchedule.id);
      }
    } else if (actualValue && actualValue !== selectedValue) {
      console.log("Updating from props:", actualValue);
      setSelectedValue(actualValue);
    }
  }, [actualValue, defaultSchedule, onScheduleChange, onChange, selectedValue]);

  return (
    <div className="space-y-2">
      <Label htmlFor="schedule_id">جدول العمل</Label>
      <Select
        value={selectedValue}
        onValueChange={handleValueChange}
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
