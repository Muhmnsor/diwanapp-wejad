
import { useState, useEffect, useRef } from "react";
import { useEmployeeSchedule } from "@/hooks/hr/useEmployeeSchedule";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

interface ScheduleInfoDetailProps {
  employeeId: string;
}

export function ScheduleInfoDetail({ employeeId }: ScheduleInfoDetailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [schedule, setSchedule] = useState<any>(null);
  const [workDays, setWorkDays] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { getEmployeeSchedule, getWorkDays } = useEmployeeSchedule();
  const prevEmployeeIdRef = useRef<string | null>(null);
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    // Check if we actually need to reload the data
    const employeeChanged = employeeId !== prevEmployeeIdRef.current;
    
    if (!employeeChanged && dataLoadedRef.current) {
      return; // Skip if employee hasn't changed and data is already loaded
    }

    const loadScheduleData = async () => {
      if (!employeeId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        prevEmployeeIdRef.current = employeeId;
        
        console.log("ScheduleInfoDetail (attendance) - Loading data for employee:", employeeId);
        
        const employeeSchedule = await getEmployeeSchedule(employeeId);
        console.log("ScheduleInfoDetail (attendance) - Retrieved schedule:", employeeSchedule);
        
        if (employeeSchedule) {
          setSchedule(employeeSchedule);
          
          const days = await getWorkDays(employeeSchedule.id);
          console.log("ScheduleInfoDetail (attendance) - Work days:", days);
          setWorkDays(days || []);
          dataLoadedRef.current = true;
        } else {
          console.log("ScheduleInfoDetail (attendance) - No schedule found");
          setSchedule(null);
          setWorkDays([]);
        }
      } catch (err) {
        console.error("ScheduleInfoDetail (attendance) - Error loading schedule data:", err);
        setError("حدث خطأ أثناء تحميل بيانات الجدول");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadScheduleData();
  }, [employeeId, getEmployeeSchedule, getWorkDays]);
  
  if (isLoading && !schedule) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!schedule) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">لا يوجد جدول عمل محدد</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Determine working days
  const workingDays = workDays
    .filter(day => day.is_working_day)
    .map(day => getDayName(day.day_of_week))
    .join("، ");
  
  return (
    <Card dir="rtl">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">{schedule.name}</h4>
          </div>
          <Badge variant="outline" className="text-xs">
            {schedule.work_hours_per_day} ساعة / {schedule.work_days_per_week} أيام
          </Badge>
        </div>
        
        <div className="mt-2 space-y-1 text-sm text-right">
          <p>
            <span className="text-muted-foreground">أيام العمل:</span>{" "}
            {workingDays || "غير محدد"}
          </p>
          
          {workDays.length > 0 && (
            <div className="grid grid-cols-7 gap-1 mt-2">
              {workDays.map((day) => (
                <div 
                  key={day.day_of_week} 
                  className={`text-center py-1 px-2 rounded-sm text-xs ${
                    day.is_working_day 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <div>{getDayShortName(day.day_of_week)}</div>
                  {day.is_working_day && (
                    <div className="text-[10px] mt-1">
                      {formatTime(day.start_time)} - {formatTime(day.end_time)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getDayName(dayOfWeek: number): string {
  const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  return days[dayOfWeek];
}

function getDayShortName(dayOfWeek: number): string {
  const days = ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];
  return days[dayOfWeek];
}

function formatTime(time: string | null): string {
  if (!time) return "-";
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
}
