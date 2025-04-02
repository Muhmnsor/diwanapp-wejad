
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSelfAttendance } from "@/hooks/hr/useSelfAttendance";
import { useUserEmployeeLink } from "@/components/hr/useUserEmployeeLink";
import { CalendarClockIcon, UserCheckIcon, UserXIcon, AlertTriangleIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

export function SelfAttendanceCard() {
  const [employeeInfo, setEmployeeInfo] = useState<any>(null);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(true);
  const { checkIn, checkOut, getTodayAttendance } = useSelfAttendance();
  const { getCurrentUserEmployee } = useUserEmployeeLink();

  // Fetch employee info
  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      setIsLoading(true);
      const result = await getCurrentUserEmployee();
      
      if (result.success && result.data) {
        setEmployeeInfo(result.data);
        // After getting employee info, fetch today's attendance
        fetchTodayAttendance();
      } else {
        setIsLoadingRecord(false);
        console.error("Error fetching employee info:", result.error);
      }
      setIsLoading(false);
    };

    fetchEmployeeInfo();
  }, []);

  // Fetch today's attendance
  const fetchTodayAttendance = async () => {
    setIsLoadingRecord(true);
    try {
      const result = await getTodayAttendance();
      if (result.success) {
        setTodayRecord(result.data);
      } else {
        console.error("Error fetching today's attendance:", result.error);
      }
    } catch (error) {
      console.error("Exception fetching attendance:", error);
    } finally {
      setIsLoadingRecord(false);
    }
  };

  // Handle check in
  const handleCheckIn = async () => {
    setIsLoading(true);
    const result = await checkIn();
    
    if (result.success) {
      await fetchTodayAttendance();
    } else if (result.alreadyCheckedIn && result.data) {
      setTodayRecord(result.data);
    }
    
    setIsLoading(false);
  };

  // Handle check out
  const handleCheckOut = async () => {
    setIsLoading(true);
    const result = await checkOut();
    
    if (result.success) {
      await fetchTodayAttendance();
    } else if (result.alreadyCheckedOut && result.data) {
      setTodayRecord(result.data);
    }
    
    setIsLoading(false);
  };

  const formatTimeFromDate = (dateString: string) => {
    if (!dateString) return "غير متوفر";
    
    try {
      const date = new Date(dateString);
      return format(date, 'hh:mm a', { locale: ar });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  if (isLoading && !employeeInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-right">تسجيل الحضور والانصراف</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <CalendarClockIcon className="h-12 w-12 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!employeeInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-right">تسجيل الحضور والانصراف</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangleIcon className="h-12 w-12 text-yellow-500" />
            <p className="text-lg">لم يتم ربط حسابك بسجل موظف</p>
            <p className="text-muted-foreground">
              يرجى التواصل مع إدارة الموارد البشرية لربط حسابك
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right">تسجيل الحضور والانصراف</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingRecord ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CalendarClockIcon className="h-8 w-8 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">جاري تحميل بيانات الحضور...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-right space-y-1">
              <p className="text-lg font-semibold">{employeeInfo.full_name}</p>
              <p className="text-muted-foreground">{employeeInfo.position || "غير محدد"}</p>
            </div>
            
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), 'EEEE, d MMMM yyyy', { locale: ar })}
                </p>
                <div className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs">
                  {todayRecord?.status === "present" ? "حاضر" : 
                   todayRecord?.status === "late" ? "متأخر" : 
                   todayRecord?.status === "absent" ? "غائب" : "غير مسجل"}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1 text-center">
                  <p className="text-xs text-muted-foreground">وقت الحضور</p>
                  <p className="font-medium">
                    {todayRecord?.check_in ? formatTimeFromDate(todayRecord.check_in) : "غير مسجل"}
                  </p>
                </div>
                <div className="space-y-1 text-center">
                  <p className="text-xs text-muted-foreground">وقت الانصراف</p>
                  <p className="font-medium">
                    {todayRecord?.check_out ? formatTimeFromDate(todayRecord.check_out) : "غير مسجل"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-center mt-6">
                <Button 
                  onClick={handleCheckIn} 
                  disabled={isLoading || (todayRecord?.check_in !== null && todayRecord?.check_in !== undefined)}
                  className="flex-1"
                >
                  <UserCheckIcon className="h-4 w-4 mr-2" />
                  تسجيل الحضور
                </Button>
                <Button 
                  onClick={handleCheckOut} 
                  disabled={isLoading || !todayRecord?.check_in || todayRecord?.check_out !== null}
                  variant="outline"
                  className="flex-1"
                >
                  <UserXIcon className="h-4 w-4 mr-2" />
                  تسجيل الانصراف
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
