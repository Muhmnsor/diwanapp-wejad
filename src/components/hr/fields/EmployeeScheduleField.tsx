
import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployeeSchedule } from "@/hooks/hr/useEmployeeSchedule";

interface EmployeeScheduleFieldProps {
  form: any;
}

export function EmployeeScheduleField({ form }: EmployeeScheduleFieldProps) {
  const { schedules, defaultSchedule, isLoadingSchedules } = useEmployeeSchedule();

  return (
    <FormField
      control={form.control}
      name="schedule_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>جدول العمل</FormLabel>
          <FormControl>
            <Select 
              onValueChange={field.onChange} 
              value={field.value} 
              disabled={isLoadingSchedules}
            >
              <SelectTrigger>
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
          </FormControl>
          <FormMessage />
          <p className="text-xs text-muted-foreground">
            جدول العمل المخصص للموظف لاحتساب الحضور والانصراف
          </p>
        </FormItem>
      )}
    />
  );
}
