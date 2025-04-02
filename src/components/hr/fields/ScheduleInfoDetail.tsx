
import { useEffect, useState, useRef } from "react";
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
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to track previous values and prevent unnecessary re-renders
  const prevScheduleIdRef = useRef<string | null>(null);
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    // Check if we actually need to reload the data
    const scheduleChanged = scheduleId !== prevScheduleIdRef.current;
    
    if (!scheduleChanged && dataLoadedRef.current) {
      return; // Skip if schedule hasn't changed and data is already loaded
    }

    const loadScheduleDetails = async () => {
      if (!schedules) return;
      
      setIsLoading(true);
      setError(null);
      prevScheduleIdRef.current = scheduleId;
      
      try {
        console.log("ScheduleInfoDetail - Loading details for scheduleId:", scheduleId);
        
        // Find the schedule in our local cache first
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
          
          // Load work days
          const days = await getWorkDays(targetSchedule.id);
          console.log("ScheduleInfoDetail - Work days loaded:", days);
          setWorkDays(days || []);
          dataLoadedRef.current = true;
        } else {
          console.log("ScheduleInfoDetail - No schedule found");
          setSchedule(null);
          setWorkDays([]);
        }
      } catch (err) {
        console.error('Error loading schedule details:', err);
        setError("حدث خطأ أثناء تحميل بيانات الجدول");
      } finally {
        setIsLoading(false);
      }
    };

    // Only load if we have schedules data available
    if (schedules?.length) {
      loadScheduleDetails();
    }
  }, [scheduleId, schedules, defaultSchedule, getWorkDays]);

  const getDayName = (dayOfWeek: number) => {
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[dayOfWeek];
  };

  // If we're still in initial loading state, show skeleton
  if (isLoading && !schedule) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    );
  }

  // If there's an error, show error message
  if (error) {
    return (
      <div className="text-sm text-red-500 text-right">
        {error}
      </div>
    );
  }

  // If there's no schedule (and we're not loading), show no schedule message
  if (!schedule) {
    return (
      <div className="text-sm text-muted-foreground text-right">
        لم يتم تعيين جدول عمل للموظف
      </div>
    );
  }

  const workingDays = workDays.filter(d => d.is_working_day);

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <p className="font-medium">{schedule.name}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {schedule.work_hours_per_day} ساعات / {schedule.work_days_per_week} أيام
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground text-right">{schedule.description}</p>
      
      <div className="text-sm text-right">
        <p className="font-medium mb-1">أيام العمل:</p>
        <p>{workingDays.map(d => getDayName(d.day_of_week)).join('، ')}</p>
      </div>
      
      {workingDays.length > 0 && (
        <div className="text-xs pt-2 border-t border-dashed">
          <p className="mb-2 font-medium text-right">أوقات الدوام:</p>
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
