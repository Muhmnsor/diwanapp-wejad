
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Clock, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useEmployeeSchedule } from "@/hooks/hr/useEmployeeSchedule";

// Define the type for the employee prop
interface Employee {
  id: string;
  full_name: string;
  schedule_id?: string;
  [key: string]: any;
}

interface SelfAttendanceToolbarProps {
  employee: Employee | null;
}

export function SelfAttendanceToolbar({ employee }: SelfAttendanceToolbarProps) {
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
  const { toast } = useToast();
  const { getWorkDays } = useEmployeeSchedule();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [canCheckIn, setCanCheckIn] = useState<boolean>(false);
  const [canCheckOut, setCanCheckOut] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Load today's attendance record when employee data is available
  useEffect(() => {
    const loadTodayAttendance = async () => {
      if (!employee?.id) return;
      
      setCheckingStatus(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      try {
        const { data, error } = await supabase
          .from('hr_attendance')
          .select('*')
          .eq('employee_id', employee.id)
          .eq('attendance_date', today)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching attendance:', error);
          toast({
            title: "خطأ في تحميل بيانات الحضور",
            description: error.message,
            variant: "destructive"
          });
        }
        
        setTodayAttendance(data || null);
        
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setCheckingStatus(false);
      }
    };
    
    loadTodayAttendance();
  }, [employee?.id]);
  
  // Check if the employee can check-in/out based on the schedule
  useEffect(() => {
    const checkAttendanceEligibility = async () => {
      if (!employee?.id) return;
      
      try {
        // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
        const currentDayOfWeek = currentTime.getDay();
        const scheduleId = employee.schedule_id;
        
        if (!scheduleId) {
          setMessage("لم يتم تعيين جدول عمل لك");
          return;
        }
        
        const workDays = await getWorkDays(scheduleId);
        const todaySchedule = workDays.find((day: any) => day.day_of_week === currentDayOfWeek);
        
        // If today is not a working day or no schedule found
        if (!todaySchedule || !todaySchedule.is_working_day) {
          setMessage("اليوم ليس يوم عمل حسب جدولك");
          return;
        }
        
        // Parse start and end times and add 30 minutes buffer before start time
        const startTime = parseTimeString(todaySchedule.start_time);
        const endTime = parseTimeString(todaySchedule.end_time);
        
        // Set buffer time (30 min before work starts, and up to 2 hours after work ends)
        const checkInStartBuffer = new Date(startTime);
        checkInStartBuffer.setMinutes(checkInStartBuffer.getMinutes() - 30);
        
        const checkOutEndBuffer = new Date(endTime);
        checkOutEndBuffer.setHours(checkOutEndBuffer.getHours() + 2);
        
        const now = new Date();
        now.setSeconds(0, 0); // Reset seconds for more accurate comparison
        
        // Check if we can check in (from 30 minutes before start time until end time)
        if (now >= checkInStartBuffer && now <= endTime && !todayAttendance) {
          setCanCheckIn(true);
          setMessage(`يمكنك تسجيل الحضور (وقت الدوام: ${formatTime(startTime)} - ${formatTime(endTime)})`);
        } 
        // Check if we can check out (from start time until 2 hours after end time)
        else if (todayAttendance && !todayAttendance.check_out && now >= startTime && now <= checkOutEndBuffer) {
          setCanCheckOut(true);
          setMessage(`يمكنك تسجيل الانصراف (وقت الدوام: ${formatTime(startTime)} - ${formatTime(endTime)})`);
        }
        // We're outside the allowed time ranges
        else if (!todayAttendance) {
          setMessage(`وقت الدوام: ${formatTime(startTime)} - ${formatTime(endTime)}`);
        }
        
      } catch (error) {
        console.error('Error checking attendance eligibility:', error);
        setMessage("حدث خطأ في التحقق من أهلية تسجيل الحضور");
      }
    };
    
    checkAttendanceEligibility();
    
    // Refresh eligibility every 5 minutes
    const interval = setInterval(checkAttendanceEligibility, 300000);
    return () => clearInterval(interval);
    
  }, [employee, todayAttendance, currentTime]);
  
  const handleCheckIn = async () => {
    if (!employee?.id) return;
    
    setIsLoading(true);
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    
    try {
      const { data, error } = await supabase
        .from('hr_attendance')
        .insert([
          {
            employee_id: employee.id,
            attendance_date: today,
            check_in: now.toISOString(),
            status: 'present'
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      setTodayAttendance(data);
      toast({
        title: "تم تسجيل الحضور بنجاح",
        description: format(now, 'HH:mm:ss'),
      });
      
      setCanCheckIn(false);
      setCanCheckOut(true);
      
    } catch (error: any) {
      console.error('Error checking in:', error);
      toast({
        title: "فشل تسجيل الحضور",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCheckOut = async () => {
    if (!employee?.id || !todayAttendance?.id) return;
    
    setIsLoading(true);
    const now = new Date();
    
    try {
      const { error } = await supabase
        .from('hr_attendance')
        .update({
          check_out: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', todayAttendance.id);
        
      if (error) throw error;
      
      // Refresh the attendance record
      const { data: updatedAttendance } = await supabase
        .from('hr_attendance')
        .select('*')
        .eq('id', todayAttendance.id)
        .single();
        
      setTodayAttendance(updatedAttendance);
      toast({
        title: "تم تسجيل الانصراف بنجاح",
        description: format(now, 'HH:mm:ss'),
      });
      
      setCanCheckOut(false);
      
    } catch (error: any) {
      console.error('Error checking out:', error);
      toast({
        title: "فشل تسجيل الانصراف",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to parse time string (e.g., "08:30:00" to Date object)
  const parseTimeString = (timeString: string | null): Date => {
    if (!timeString) return new Date();
    
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    
    now.setHours(hours || 0, minutes || 0, 0, 0);
    return now;
  };
  
  // Format time as HH:MM
  const formatTime = (date: Date): string => {
    return format(date, 'HH:mm');
  };
  
  if (checkingStatus) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-pulse flex space-x-4">
          <div className="h-10 w-24 bg-slate-200 rounded"></div>
          <div className="h-10 w-24 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <p className="text-sm text-center">{message}</p>
        
        {todayAttendance ? (
          <div className="bg-muted/50 p-3 rounded-md text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">وقت الحضور:</span>
              <span className="text-primary flex items-center">
                <Clock className="w-4 h-4 ml-1" />
                {todayAttendance.check_in 
                  ? format(new Date(todayAttendance.check_in), 'HH:mm:ss') 
                  : '-'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">وقت الانصراف:</span>
              <span className="text-primary flex items-center">
                <Clock className="w-4 h-4 ml-1" />
                {todayAttendance.check_out 
                  ? format(new Date(todayAttendance.check_out), 'HH:mm:ss') 
                  : '-'}
              </span>
            </div>
          </div>
        ) : null}
      </div>
      
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          disabled={!canCheckIn || isLoading}
          onClick={handleCheckIn}
          className="flex-1"
        >
          <LogIn className="mr-2 h-4 w-4" />
          تسجيل الحضور
        </Button>
        
        <Button
          variant="outline"
          disabled={!canCheckOut || isLoading}
          onClick={handleCheckOut}
          className="flex-1"
        >
          <LogOut className="mr-2 h-4 w-4" />
          تسجيل الانصراف
        </Button>
      </div>
    </div>
  );
}
