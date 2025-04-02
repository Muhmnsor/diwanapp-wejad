
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAttendanceReport } from '@/hooks/hr/useAttendanceReport';

interface AttendanceReportProps {
  startDate?: Date;
  endDate?: Date;
}

export const AttendanceReport: React.FC<AttendanceReportProps> = ({ startDate, endDate }) => {
  const { data, isLoading, error } = useAttendanceReport(startDate, endDate);
  
  if (isLoading) {
    return <div className="text-center py-10">جاري تحميل البيانات...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 py-10">حدث خطأ: {error.message}</div>;
  }
  
  if (!data || !data.records.length) {
    return <div className="text-center py-10">لا توجد بيانات للفترة المحددة</div>;
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تقرير الحضور</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-md text-center">
              <div className="text-2xl font-bold">{data.stats.presentCount}</div>
              <div className="text-sm">الحضور</div>
            </div>
            
            <div className="p-4 bg-red-50 text-red-700 rounded-md text-center">
              <div className="text-2xl font-bold">{data.stats.absentCount}</div>
              <div className="text-sm">الغياب</div>
            </div>
            
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md text-center">
              <div className="text-2xl font-bold">{data.stats.lateCount}</div>
              <div className="text-sm">التأخير</div>
            </div>
            
            <div className="p-4 bg-blue-50 text-blue-700 rounded-md text-center">
              <div className="text-2xl font-bold">{data.stats.leaveCount}</div>
              <div className="text-sm">الإجازات</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
