
import { useState, useEffect } from "react";
import { useSelfAttendance } from "@/hooks/hr/useSelfAttendance";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { formatTime } from "@/utils/dateTimeUtils";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Employee {
  id: string;
  full_name: string;
  employee_number: string;
  position: string;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
}

export function SelfAttendanceToolbar() {
  const { checkIn, checkOut, getTodayAttendance, getEmployeeInfo, isLoading } = useSelfAttendance();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load employee and attendance data
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const employeeResult = await getEmployeeInfo();
        if (employeeResult.success) {
          setEmployee(employeeResult.data);
        }

        const attendanceResult = await getTodayAttendance();
        if (attendanceResult.success) {
          setAttendanceRecord(attendanceResult.data);
        }
      } catch (error) {
        console.error("Error loading attendance data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [getEmployeeInfo, getTodayAttendance]);

  // Handle check in
  const handleCheckIn = async () => {
    if (!employee) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على بيانات الموظف",
        variant: "destructive",
      });
      return;
    }
    
    const result = await checkIn();
    if (result.success) {
      setAttendanceRecord(result.data);
      toast({
        title: "تم تسجيل الحضور",
        description: `تم تسجيل حضورك في ${formatTime(result.data.check_in)}`,
      });
    }
  };

  // Handle check out
  const handleCheckOut = async () => {
    if (!attendanceRecord) {
      toast({
        title: "خطأ",
        description: "لم يتم تسجيل الحضور بعد",
        variant: "destructive",
      });
      return;
    }
    
    const result = await checkOut();
    if (result.success) {
      setAttendanceRecord(result.data);
      toast({
        title: "تم تسجيل الانصراف",
        description: `تم تسجيل انصرافك في ${formatTime(result.data.check_out)}`,
      });
    }
  };

  // If no employee data, don't show the toolbar
  if (!employee && !isLoadingData) {
    return null;
  }

  // Get current state text
  const getButtonText = () => {
    if (isLoadingData || isLoading) {
      return "جاري التحميل...";
    }
    
    const employeeName = employee?.full_name ? `(${employee.full_name})` : '';
    
    if (!attendanceRecord || !attendanceRecord.check_in) {
      return `تسجيل الحضور ${employeeName}`;
    }
    
    if (attendanceRecord.check_in && !attendanceRecord.check_out) {
      return `تسجيل الانصراف ${employeeName}`;
    }
    
    return `تم تسجيل الحضور والانصراف ${employeeName}`;
  };

  // Determine button variant and handler
  const getButtonProps = () => {
    if (!attendanceRecord || !attendanceRecord.check_in) {
      return {
        variant: "default" as const,
        onClick: handleCheckIn,
        icon: <LogIn className="ml-2 h-4 w-4" />,
        disabled: isLoading || isLoadingData
      };
    }
    
    if (attendanceRecord.check_in && !attendanceRecord.check_out) {
      return {
        variant: "destructive" as const,
        onClick: handleCheckOut,
        icon: <LogOut className="ml-2 h-4 w-4" />,
        disabled: isLoading || isLoadingData
      };
    }
    
    return {
      variant: "outline" as const,
      onClick: () => {},
      icon: null,
      disabled: true
    };
  };

  const buttonProps = getButtonProps();
  
  // Get tooltip content based on attendance state
  const getTooltipContent = () => {
    if (!employee) return "لم يتم العثور على بيانات الموظف";
    
    if (!attendanceRecord) return `مرحباً ${employee.full_name}`;
    
    const checkInTime = attendanceRecord.check_in ? formatTime(attendanceRecord.check_in) : null;
    const checkOutTime = attendanceRecord.check_out ? formatTime(attendanceRecord.check_out) : null;
    
    if (checkInTime && checkOutTime) {
      return `تم تسجيل الحضور: ${checkInTime}\nتم تسجيل الانصراف: ${checkOutTime}`;
    }
    
    if (checkInTime) {
      return `تم تسجيل الحضور: ${checkInTime}`;
    }
    
    return `مرحباً ${employee.full_name}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={buttonProps.variant}
              onClick={buttonProps.onClick}
              disabled={buttonProps.disabled}
              className="shadow-lg"
            >
              {isLoading || isLoadingData ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                buttonProps.icon
              )}
              {getButtonText()}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-right">
            <p className="whitespace-pre-line">{getTooltipContent()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

