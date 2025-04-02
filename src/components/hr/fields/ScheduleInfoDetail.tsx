
import { useEffect, useState } from "react";
import { useEmployeeSchedule } from "@/hooks/hr/useEmployeeSchedule";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ScheduleInfoDetailProps {
  scheduleId: string | null;
}

export function ScheduleInfoDetail({ scheduleId }: ScheduleInfoDetailProps) {
  const { schedules, defaultSchedule, getWorkDays } = useEmployeeSchedule();
  const [schedule, setSchedule] = useState<any>(null);
  const [workDays, setWorkDays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadScheduleDetails = async () => {
      if (!schedules) return;
      
      setIsLoading(true);
      console.log("ScheduleInfoDetail - Loading schedule details for ID:", scheduleId);
      
      try {
        // تحديد الجدول المستخدم (المحدد أو الافتراضي)
        let targetSchedule = null;
        
        if (scheduleId) {
          targetSchedule = schedules.find(s => s.id === scheduleId);
          console.log("ScheduleInfoDetail - Found matching schedule:", targetSchedule);
        } 
        
        if (!targetSchedule && defaultSchedule) {
          console.log("ScheduleInfoDetail - Using default schedule instead");
          targetSchedule = defaultSchedule;
        }
        
        if (targetSchedule) {
          setSchedule(targetSchedule);
          
          // تحميل تفاصيل أيام العمل
          const days = await getWorkDays(targetSchedule.id);
          console.log("ScheduleInfoDetail - Work days loaded:", days);
          setWorkDays(days || []);
        } else {
          console.log("ScheduleInfoDetail - No schedule found");
          setSchedule(null);
          setWorkDays([]);
        }
      } catch (error) {
        console.error('Error loading schedule details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (schedules?.length) {
      loadScheduleDetails();
    }
  }, [scheduleId, schedules, defaultSchedule, getWorkDays]);

  const getDayName = (dayOfWeek: number) => {
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[dayOfWeek];
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-sm text-muted-foreground">
        لم يتم تعيين جدول عمل للموظف
      </div>
    );
  }

  const workingDays = workDays.filter(d => d.is_working_day);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <p className="font-medium">{schedule.name}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {schedule.work_hours_per_day} ساعات / {schedule.work_days_per_week} أيام
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground">{schedule.description}</p>
      
      <div className="text-sm">
        <p className="font-medium mb-1">أيام العمل:</p>
        <p>{workingDays.map(d => getDayName(d.day_of_week)).join('، ')}</p>
      </div>
      
      {workingDays.length > 0 && (
        <div className="text-xs pt-2 border-t border-dashed">
          <p className="mb-2 font-medium">أوقات الدوام:</p>
          <div className="grid gap-1">
            {workingDays.map(day => (
              <div key={day.id} className="flex justify-between items-center">
                <span>{getDayName(day.day_of_week)}</span>
                <span>
                  {day.start_time?.substring(0, 5)} - {day.end_time?.substring(0, 5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
