
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployeeSchedule } from "@/hooks/hr/useEmployeeSchedule";

interface EmployeeScheduleFieldProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function EmployeeScheduleField({ value, onChange }: EmployeeScheduleFieldProps) {
  const { schedules, defaultSchedule, isLoadingSchedules } = useEmployeeSchedule();
  const [selectedValue, setSelectedValue] = useState<string>(value || "");

  // تعيين الجدول الافتراضي إذا لم يكن هناك قيمة محددة
  useEffect(() => {
    if ((!value || value === "") && defaultSchedule && defaultSchedule.id) {
      console.log("EmployeeScheduleField (fields) - Setting default schedule:", defaultSchedule.id);
      setSelectedValue(defaultSchedule.id);
      onChange(defaultSchedule.id);
    } else if (value && value !== selectedValue) {
      console.log("EmployeeScheduleField (fields) - Updating from props:", value);
      setSelectedValue(value);
    }
  }, [value, defaultSchedule, onChange, selectedValue]);

  const handleScheduleChange = (newValue: string) => {
    if (!newValue) return; // Prevent empty values
    console.log("EmployeeScheduleField (fields) - Schedule changed to:", newValue);
    setSelectedValue(newValue);
    onChange(newValue);
  };

  // Safe value handling - ensure we never pass empty string as value
  const safeValue = selectedValue || undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor="schedule_id">جدول العمل</Label>
      <Select
        value={safeValue}
        onValueChange={handleScheduleChange}
        disabled={isLoadingSchedules}
      >
        <SelectTrigger id="schedule_id">
          <SelectValue placeholder={isLoadingSchedules ? "جاري التحميل..." : "اختر جدول العمل"} />
        </SelectTrigger>
        <SelectContent>
          {schedules && schedules.length > 0 ? (
            schedules.map((schedule) => (
              <SelectItem key={schedule.id} value={schedule.id}>
                {schedule.name} {schedule.is_default && "(افتراضي)"}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no_schedules_placeholder">لا توجد جداول عمل</SelectItem>
          )}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        جدول العمل المخصص للموظف لاحتساب الحضور والانصراف
      </p>
    </div>
  );
}
