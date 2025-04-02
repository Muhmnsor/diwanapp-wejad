import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface AttendanceReportProps {
  startDate?: Date;
  endDate?: Date;
}

export function AttendanceReport({ startDate, endDate }: AttendanceReportProps) {
  // Format dates for display
  const formattedStartDate = startDate ? format(startDate, 'dd MMMM yyyy', { locale: ar }) : '';
  const formattedEndDate = endDate ? format(endDate, 'dd MMMM yyyy', { locale: ar }) : '';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          تقرير الحضور
          {startDate && endDate && (
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              الفترة: {formattedStartDate} إلى {formattedEndDate}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content of the attendance report would go here */}
        <div className="text-center p-8 text-muted-foreground">
          يتم إنشاء التقرير...
        </div>
      </CardContent>
    </Card>
  );
}
