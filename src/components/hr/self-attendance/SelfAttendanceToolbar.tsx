
import { useState, useEffect } from "react";
import { useSelfAttendance } from "@/hooks/hr/useSelfAttendance";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, LogOut } from "lucide-react";
import { formatTime } from "@/utils/dateTimeUtils";
import { toast } from "@/hooks/use-toast";

export function SelfAttendanceToolbar() {
  const { checkIn, checkOut, getTodayAttendance, getEmployeeInfo, isLoading } = useSelfAttendance();
  const [employee, setEmployee] = useState<any>(null);
  const [attendanceRecord, setAttendanceRecord] = useState<any>(null);
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

  // Format time from timestamp
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return null;
    try {
      return formatTime(timestamp);
    } catch (error) {
      return null;
    }
  };

  // Get current state text
  const getButtonText = () => {
    if (isLoadingData || isLoading) {
      return "جاري التحميل...";
    }
    
    if (!attendanceRecord || !attendanceRecord.check_in) {
      return "تسجيل الحضور";
    }
    
    if (attendanceRecord.check_in && !attendanceRecord.check_out) {
      return "تسجيل الانصراف";
    }
    
    return "تم تسجيل الحضور والانصراف";
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

  return (
    <div className="fixed bottom-4 right-4 z-50">
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
    </div>
  );
}
