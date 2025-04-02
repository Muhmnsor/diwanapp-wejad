
import { Skeleton } from "@/components/ui/skeleton";
import { Clipboard, Clock, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { useAttendanceReport } from "@/hooks/hr/useAttendanceReport";

interface AttendanceStatsProps {
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
}

export function AttendanceStats({ 
  startDate, 
  endDate, 
  employeeId 
}: AttendanceStatsProps) {
  const { data, isLoading } = useAttendanceReport(startDate, endDate, employeeId);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    );
  }
  
  if (!data) {
    return null;
  }
  
  const { stats } = data;
  
  return (
    <div dir="rtl" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Clipboard className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">إجمالي السجلات</p>
            <p className="font-bold text-lg">{stats.totalRecords}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <UserCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">الحضور</p>
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg">{stats.presentCount}</p>
              <p className="text-xs text-green-600">
                ({stats.presentPercentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <UserX className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">الغياب</p>
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg">{stats.absentCount}</p>
              <p className="text-xs text-red-600">
                ({stats.absentPercentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-full">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">تأخير</p>
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg">{stats.lateCount}</p>
              <p className="text-xs text-amber-600">
                ({stats.latePercentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
