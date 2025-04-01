import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface WorkDay {
  id: string;
  schedule_id: string;
  day_of_week: number;
  is_working_day: boolean;
  start_time: string | null;
  end_time: string | null;
}

interface WorkDaysEditorProps {
  workDays: WorkDay[];
  onChange: (workDays: WorkDay[]) => void;
}

export function WorkDaysEditor({ workDays, onChange }: WorkDaysEditorProps) {
  const getDayName = (dayOfWeek: number): string => {
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[dayOfWeek];
  };

  const handleWorkingDayChange = (dayIndex: number, checked: boolean) => {
    const newWorkDays = [...workDays];
    newWorkDays[dayIndex].is_working_day = checked;
    
    // Clear times if not a working day
    if (!checked) {
      newWorkDays[dayIndex].start_time = null;
      newWorkDays[dayIndex].end_time = null;
    } else if (!newWorkDays[dayIndex].start_time && !newWorkDays[dayIndex].end_time) {
      // Set default times if becoming a working day
      newWorkDays[dayIndex].start_time = "08:00:00";
      newWorkDays[dayIndex].end_time = "16:00:00";
    }
    
    onChange(newWorkDays);
  };

  const handleTimeChange = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
    const newWorkDays = [...workDays];
    // Store as HH:MM:00 format for database
    newWorkDays[dayIndex][field] = value ? `${value}:00` : null;
    onChange(newWorkDays);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اليوم</TableHead>
            <TableHead>يوم عمل</TableHead>
            <TableHead>وقت البدء</TableHead>
            <TableHead>وقت الانتهاء</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workDays.map((day, index) => (
            <TableRow key={day.id}>
              <TableCell className="font-medium">{getDayName(day.day_of_week)}</TableCell>
              <TableCell>
                <Checkbox
                  checked={day.is_working_day}
                  onCheckedChange={(checked) => 
                    handleWorkingDayChange(index, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  type="time"
                  value={day.start_time ? day.start_time.substring(0, 5) : ""}
                  onChange={(e) => handleTimeChange(index, 'start_time', e.target.value)}
                  disabled={!day.is_working_day}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="time"
                  value={day.end_time ? day.end_time.substring(0, 5) : ""}
                  onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
                  disabled={!day.is_working_day}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

