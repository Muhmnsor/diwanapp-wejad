
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmployeeReportProps {
  startDate?: Date;
  endDate?: Date;
}

export const EmployeeReport: React.FC<EmployeeReportProps> = ({ startDate, endDate }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تقرير الموظفين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            سيتم تنفيذ هذا التقرير قريباً
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
