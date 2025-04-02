
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserEmployeeLink } from "@/components/hr/useUserEmployeeLink";
import { useSelfAttendance } from "@/hooks/hr/useSelfAttendance";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

export function SelfAttendanceCard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { getCurrentUserEmployee, isLoading: isLinkLoading } = useUserEmployeeLink();
  const { checkInAttendance, checkOutAttendance, getTodayAttendance, isLoading: isAttendanceLoading } = useSelfAttendance();
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [isEmployeeLinked, setIsEmployeeLinked] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  
  const isLoading = isLinkLoading || isAttendanceLoading;

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Check if the current user is linked to an employee
  useEffect(() => {
    async function checkEmployeeLink() {
      const result = await getCurrentUserEmployee();
      if (result.success && result.isLinked && result.employee) {
        setIsEmployeeLinked(true);
        setEmployeeData(result.employee);
        
        // If linked, get today's attendance
        const attendance = await getTodayAttendance(result.employee.id);
        setTodayAttendance(attendance);
      } else {
        setIsEmployeeLinked(false);
        setEmployeeData(null);
      }
    }
    
    checkEmployeeLink();
  }, []);
  
  const handleCheckIn = async () => {
    if (!employeeData) return;
    
    try {
      const result = await checkInAttendance(employeeData.id);
      if (result.success) {
        toast.success("تم تسجيل الحضور بنجاح");
        setTodayAttendance(result.attendance);
      } else {
        toast.error(result.error?.message || "حدث خطأ أثناء تسجيل الحضور");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الحضور");
    }
  };
  
  const handleCheckOut = async () => {
    if (!employeeData || !todayAttendance) return;
    
    try {
      const result = await checkOutAttendance(employeeData.id, todayAttendance.id);
      if (result.success) {
        toast.success("تم تسجيل الانصراف بنجاح");
        setTodayAttendance(result.attendance);
      } else {
        toast.error(result.error?.message || "حدث خطأ أثناء تسجيل الانصراف");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الانصراف");
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">تسجيل الحضور</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (!isEmployeeLinked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">تسجيل الحضور</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <CardDescription>
            لم يتم ربط حسابك بسجل موظف.
            يرجى التواصل مع إدارة الموارد البشرية.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">تسجيل الحضور</CardTitle>
        <CardDescription className="text-center">
          {formatDate(currentTime)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold text-center">
          {formatTime(currentTime)}
        </div>
        
        {todayAttendance && (
          <div className="space-y-2 text-center text-sm">
            {todayAttendance.check_in_time && (
              <div>
                <span className="font-semibold">وقت الحضور: </span>
                {new Date(todayAttendance.check_in_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            
            {todayAttendance.check_out_time && (
              <div>
                <span className="font-semibold">وقت الانصراف: </span>
                {new Date(todayAttendance.check_out_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            
            {!todayAttendance.check_out_time && todayAttendance.check_in_time && (
              <div className="text-green-600 font-semibold">
                يوم عمل نشط
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center space-x-2 space-x-reverse">
        {!todayAttendance?.check_in_time && (
          <Button onClick={handleCheckIn} className="w-full">
            تسجيل الحضور
          </Button>
        )}
        
        {todayAttendance?.check_in_time && !todayAttendance?.check_out_time && (
          <Button onClick={handleCheckOut} variant="outline" className="w-full">
            تسجيل الانصراف
          </Button>
        )}
        
        {todayAttendance?.check_in_time && todayAttendance?.check_out_time && (
          <Button disabled className="w-full">
            تم تسجيل الحضور والانصراف
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
