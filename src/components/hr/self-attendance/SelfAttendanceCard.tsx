
import { useState, useEffect } from "react";
import { useSelfAttendance } from "@/hooks/hr/useSelfAttendance";
import { useUserEmployeeLink } from "@/components/hr/useUserEmployeeLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, LogIn, LogOut, UserIcon } from "lucide-react";
import { formatDateWithDay, formatTime } from "@/utils/dateTimeUtils";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export function SelfAttendanceCard() {
  const { checkIn, checkOut, getTodayAttendance, getEmployeeInfo, isLoading: attendanceLoading } = useSelfAttendance();
  const { getCurrentUserEmployee, isFetching: employeeLinkFetching } = useUserEmployeeLink();
  const [employee, setEmployee] = useState<any>(null);
  const [attendanceRecord, setAttendanceRecord] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLinkedToEmployee, setIsLinkedToEmployee] = useState<boolean | null>(null);

  // Load employee and attendance data
useEffect(() => {
  const loadData = async () => {
    setIsLoadingData(true);
    
    try {
      // First check if user is linked to an employee
      const linkResult = await getCurrentUserEmployee();
      console.log("Employee link check:", linkResult);
      
      // Always set this value regardless of success
      setIsLinkedToEmployee(linkResult.isLinked);
      
      if (linkResult.success && linkResult.isLinked) {
        // If linked, get employee info and attendance data
        const employeeResult = await getEmployeeInfo();
        if (employeeResult.success) {
          setEmployee(employeeResult.data);
        }

        const attendanceResult = await getTodayAttendance();
        if (attendanceResult.success) {
          setAttendanceRecord(attendanceResult.data);
        }
      }
    } catch (error) {
      console.error("Error loading self-attendance data:", error);
    } finally {
      // Always finish loading, even on error
      setIsLoadingData(false);
    }
  };

  loadData();
}, []);


  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Handle check in
  const handleCheckIn = async () => {
    const result = await checkIn();
    if (result.success) {
      setAttendanceRecord(result.data);
    }
  };

  // Handle check out
  const handleCheckOut = async () => {
    const result = await checkOut();
    if (result.success) {
      setAttendanceRecord(result.data);
    }
  };

  // Format time from timestamp
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '-';
    try {
      return formatTime(timestamp);
    } catch (error) {
      return timestamp;
    }
  };

  // Loading state
  if (isLoadingData || employeeLinkFetching) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>تسجيل الحضور</CardTitle>
          <CardDescription>جاري تحميل البيانات...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
        <CardFooter className="flex justify-around">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  // User not linked to an employee
  if (isLinkedToEmployee === false) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>تسجيل الحضور</CardTitle>
          <CardDescription>لم يتم ربط حسابك بموظف</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <UserIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            لاستخدام ميزة تسجيل الحضور الذاتي، يجب ربط حسابك كمستخدم بسجل موظف.
          </p>
          <p className="text-sm text-muted-foreground">
            يرجى التواصل مع مدير النظام أو الانتقال إلى إدارة المستخدمين لربط حسابك.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link to="/admin/hr/employees">
            <Button variant="default">
              الانتقال إلى إدارة الموظفين
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // No employee data found
  if (!employee) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>تسجيل الحضور</CardTitle>
          <CardDescription>لم يتم العثور على بيانات الموظف</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            لم يتم العثور على بياناتك كموظف في النظام. يرجى التواصل مع قسم الموارد البشرية.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Normal attendance card display
  const today = new Date();
  const formattedDate = formatDateWithDay(today.toISOString().split('T')[0]);
  const formattedTime = today.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>تسجيل الحضور</CardTitle>
        <CardDescription>
          مرحباً {employee.full_name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <span className="text-muted-foreground text-sm">التاريخ</span>
            <span className="font-bold text-lg">{formattedDate}</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <span className="text-muted-foreground text-sm">الوقت الحالي</span>
            <div className="font-bold text-lg flex items-center">
              <Clock className="h-4 w-4 ml-1" />
              {formattedTime}
            </div>
          </div>
        </div>
        
        {attendanceRecord ? (
          <div className="grid grid-cols-2 gap-4 border rounded-lg p-4">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">وقت الحضور</p>
              <p className="font-bold text-lg text-green-600">
                {formatTimestamp(attendanceRecord.check_in)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">وقت الانصراف</p>
              <p className={`font-bold text-lg ${attendanceRecord.check_out ? 'text-red-600' : 'text-gray-400'}`}>
                {attendanceRecord.check_out ? formatTimestamp(attendanceRecord.check_out) : 'لم يتم التسجيل بعد'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center p-4 border rounded-lg bg-muted/30">
            <p className="text-muted-foreground">لم تقم بتسجيل الحضور اليوم</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-around">
        <Button
          variant="default"
          disabled={attendanceLoading || (attendanceRecord && attendanceRecord.check_in)}
          onClick={handleCheckIn}
          className="flex-1 ml-2"
        >
          {attendanceLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <LogIn className="ml-2 h-4 w-4" />}
          تسجيل الحضور
        </Button>
        <Button
          variant="outline"
          disabled={attendanceLoading || !attendanceRecord || (attendanceRecord && attendanceRecord.check_out)}
          onClick={handleCheckOut}
          className="flex-1 mr-2"
        >
          {attendanceLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <LogOut className="ml-2 h-4 w-4" />}
          تسجيل الانصراف
        </Button>
      </CardFooter>
    </Card>
  );
}
