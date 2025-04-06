
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { Clock, CheckCheck, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface SelfAttendanceToolbarProps {
  employee: any;
}

export function SelfAttendanceToolbar({ employee }: SelfAttendanceToolbarProps) {
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [canCheckOut, setCanCheckOut] = useState(false);
  const [workSchedule, setWorkSchedule] = useState<any>(null);
  const [workDay, setWorkDay] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Fetch today's attendance record
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      if (!employee?.id) return;

      const today = new Date();
      const formattedDate = format(today, "yyyy-MM-dd");

      try {
        const { data, error } = await supabase
          .from("hr_attendance")
          .select("*")
          .eq("employee_id", employee.id)
          .eq("attendance_date", formattedDate)
          .maybeSingle();

        if (error) throw error;

        setTodayAttendance(data);
        console.log("Today's attendance:", data);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      }
    };

    fetchTodayAttendance();
  }, [employee?.id]);

  // Fetch employee schedule information
  useEffect(() => {
    const fetchScheduleInfo = async () => {
      if (!employee?.id) return;

      try {
        // First check if employee has schedule_id
        if (employee.schedule_id) {
          const { data: schedule, error: scheduleError } = await supabase
            .from("hr_work_schedules")
            .select("*")
            .eq("id", employee.schedule_id)
            .single();

          if (scheduleError) throw scheduleError;

          setWorkSchedule(schedule);
          console.log("Employee schedule:", schedule);

          // Get work day info for today
          const today = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
          
          const { data: workDayData, error: workDayError } = await supabase
            .from("hr_work_days")
            .select("*")
            .eq("schedule_id", schedule.id)
            .eq("day_of_week", today)
            .single();

          if (workDayError) throw workDayError;

          setWorkDay(workDayData);
          console.log("Work day info:", workDayData);
        } else {
          console.log("Employee has no assigned schedule");
        }
      } catch (error) {
        console.error("Failed to fetch schedule information:", error);
      }
    };

    fetchScheduleInfo();
  }, [employee?.id]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Determine if employee can check in or check out based on schedule
  useEffect(() => {
    if (!workDay) {
      setCanCheckIn(false);
      setCanCheckOut(false);
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Format is "HH:MM:SS"
    let startTimeInMinutes = 0;
    let endTimeInMinutes = 0;
    
    if (workDay.start_time) {
      const [startHour, startMinute] = workDay.start_time.split(':').map(Number);
      startTimeInMinutes = startHour * 60 + startMinute;
    }
    
    if (workDay.end_time) {
      const [endHour, endMinute] = workDay.end_time.split(':').map(Number);
      endTimeInMinutes = endHour * 60 + endMinute;
    }

    // Allow check-in 30 minutes before shift start until 2 hours after shift start
    const earlyCheckInWindow = startTimeInMinutes - 30;
    const lateCheckInWindow = startTimeInMinutes + 120;

    // Allow check-out from 30 minutes before shift end until 2 hours after shift end
    const earlyCheckOutWindow = endTimeInMinutes - 30;
    const lateCheckOutWindow = endTimeInMinutes + 120;

    // Check if today is a working day
    if (!workDay.is_working_day) {
      console.log("Today is not a working day");
      setCanCheckIn(false);
      setCanCheckOut(false);
      return;
    }

    console.log("Current time in minutes:", currentTimeInMinutes);
    console.log("Check-in window:", earlyCheckInWindow, "to", lateCheckInWindow);
    console.log("Check-out window:", earlyCheckOutWindow, "to", lateCheckOutWindow);

    // Can check in if in the check-in window and haven't already checked in
    setCanCheckIn(
      currentTimeInMinutes >= earlyCheckInWindow && 
      currentTimeInMinutes <= lateCheckInWindow && 
      !todayAttendance?.check_in
    );

    // Can check out if already checked in and in the check-out window
    setCanCheckOut(
      !!todayAttendance?.check_in && 
      !todayAttendance?.check_out &&
      currentTimeInMinutes >= earlyCheckOutWindow && 
      currentTimeInMinutes <= lateCheckOutWindow
    );

  }, [workDay, todayAttendance, currentTime]);

  const handleCheckIn = async () => {
    if (!employee?.id || !user?.id) return;

    setIsLoading(true);
    try {
      const now = new Date();
      const checkInTime = format(now, "HH:mm");
      const today = format(now, "yyyy-MM-dd");

      // Check if already checked in today
      if (todayAttendance?.check_in) {
        toast({
          title: "تم تسجيل الحضور مسبقًا",
          description: "لقد قمت بتسجيل الحضور اليوم بالفعل",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("hr_attendance")
        .insert({
          employee_id: employee.id,
          attendance_date: today,
          check_in: format(now, "yyyy-MM-dd'T'HH:mm:ss"),
          status: "present",
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTodayAttendance(data);
      toast({
        title: "تم تسجيل الحضور",
        description: `تم تسجيل حضورك الساعة ${checkInTime}`,
      });
    } catch (error: any) {
      console.error("Error checking in:", error);
      toast({
        title: "خطأ في تسجيل الحضور",
        description: error.message || "حدث خطأ أثناء محاولة تسجيل الحضور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!employee?.id || !todayAttendance?.id || !user?.id) return;

    setIsLoading(true);
    try {
      const now = new Date();
      const checkOutTime = format(now, "HH:mm");

      // Check if already checked out
      if (todayAttendance.check_out) {
        toast({
          title: "تم تسجيل الانصراف مسبقًا",
          description: "لقد قمت بتسجيل الانصراف اليوم بالفعل",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("hr_attendance")
        .update({
          check_out: format(now, "yyyy-MM-dd'T'HH:mm:ss"),
        })
        .eq("id", todayAttendance.id)
        .select()
        .single();

      if (error) throw error;

      setTodayAttendance(data);
      toast({
        title: "تم تسجيل الانصراف",
        description: `تم تسجيل انصرافك الساعة ${checkOutTime}`,
      });
    } catch (error: any) {
      console.error("Error checking out:", error);
      toast({
        title: "خطأ في تسجيل الانصراف",
        description: error.message || "حدث خطأ أثناء محاولة تسجيل الانصراف",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string): string => {
    if (!time) return "";
    // Extract hours and minutes from ISO string
    return time.substring(11, 16);
  };

  const getAttendanceStatus = () => {
    if (!workDay || !workDay.is_working_day) {
      return {
        message: "اليوم ليس يوم عمل",
        color: "text-muted-foreground"
      };
    }

    if (!todayAttendance) {
      if (canCheckIn) {
        return {
          message: "يمكنك تسجيل الحضور الآن",
          color: "text-blue-600"
        };
      }
      return {
        message: "لم يتم تسجيل الحضور اليوم",
        color: "text-muted-foreground"
      };
    }

    if (todayAttendance.check_in && !todayAttendance.check_out) {
      if (canCheckOut) {
        return {
          message: "يمكنك تسجيل الانصراف الآن",
          color: "text-yellow-600"
        };
      }
      return {
        message: `تم تسجيل الحضور الساعة ${formatTime(todayAttendance.check_in)}`,
        color: "text-green-600"
      };
    }

    if (todayAttendance.check_in && todayAttendance.check_out) {
      return {
        message: `تم تسجيل الحضور والانصراف اليوم`,
        color: "text-green-600"
      };
    }

    return {
      message: "حالة غير معروفة",
      color: "text-muted-foreground"
    };
  };

  const { message, color } = getAttendanceStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-muted-foreground ml-2" />
          <span className={color}>{message}</span>
        </div>
        <div className="text-muted-foreground">
          {format(currentTime, "HH:mm", { locale: ar })}
        </div>
      </div>

      {todayAttendance && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center border rounded-md p-3">
            <span className="text-sm text-muted-foreground">الحضور</span>
            <span className="font-bold">
              {todayAttendance.check_in
                ? formatTime(todayAttendance.check_in)
                : "---"}
            </span>
          </div>
          <div className="flex flex-col items-center border rounded-md p-3">
            <span className="text-sm text-muted-foreground">الانصراف</span>
            <span className="font-bold">
              {todayAttendance.check_out
                ? formatTime(todayAttendance.check_out)
                : "---"}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!todayAttendance?.check_out && (
          <>
            {canCheckIn && (
              <Button
                onClick={handleCheckIn}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg"
                disabled={isLoading || !canCheckIn}
              >
                <CheckCheck className="ml-2 h-4 w-4" />
                تسجيل الحضور
              </Button>
            )}
            
            {canCheckOut && (
              <Button
                onClick={handleCheckOut}
                variant="destructive"
                className="flex-1 shadow-lg"
                disabled={isLoading || !canCheckOut}
              >
                <XCircle className="ml-2 h-4 w-4" />
                تسجيل الانصراف
              </Button>
            )}
          </>
        )}

        {(!canCheckIn && !canCheckOut && !todayAttendance?.check_out) && (
          <Button 
            disabled 
            className="flex-1 opacity-70"
          >
            <Clock className="ml-2 h-4 w-4" />
            لا يمكن تسجيل الحضور/الانصراف حاليًا
          </Button>
        )}
      </div>

      {workSchedule && workDay && (
        <div className="text-sm text-muted-foreground border-t pt-3 mt-3">
          <div>جدول العمل: {workSchedule.name}</div>
          {workDay.is_working_day ? (
            <div>
              ساعات العمل: {workDay.start_time?.substring(0, 5)} إلى {workDay.end_time?.substring(0, 5)}
            </div>
          ) : (
            <div>اليوم ليس يوم عمل</div>
          )}
        </div>
      )}
    </div>
  );
}
