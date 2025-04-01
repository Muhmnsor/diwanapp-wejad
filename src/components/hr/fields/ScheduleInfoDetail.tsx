import { useEffect, useState } from "react";
import { useEmployeeSchedule } from "@/hooks/hr/useEmployeeSchedule";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

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
      setIsLoading(true);
      try {
        // تحديد الجدول المستخدم (المحدد أو الافتراضي)
        const targetSchedule = scheduleId 
          ? schedules?.find(s => s.id === scheduleId)
          : defaultSchedule;
        
        if (targetSchedule) {
          setSchedule(targetSchedule);
          
          // تحميل تفاصيل أيام العمل
          const days = await getWorkDays(targetSchedule.id);
          setWorkDays(days || []);
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
        لم يتم تعيين جدول عمل
      </div>
    );
  }

  const workingDays = workDays.filter(d => d.is_working_day);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <p className="font-medium">{schedule.name}</p>
      </div>
      
      <p className="text-sm">{schedule.description}</p>
      
      <div className="text-sm text-muted-foreground">
        <p>{schedule.work_hours_per_day} ساعات يومياً، {schedule.work_days_per_week} أيام أسبوعياً</p>
        <p>أيام العمل: {workingDays.map(d => getDayName(d.day_of_week)).join('، ')}</p>
      </div>
      
      <div className="text-xs mt-2 pt-2 border-t border-dashed">
        <p className="mb-1 font-medium">أوقات الدوام:</p>
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
  );
}

