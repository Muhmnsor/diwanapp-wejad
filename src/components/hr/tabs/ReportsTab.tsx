
import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { HRReports } from "../reports/HRReports";
import { addDays } from "date-fns";

export function ReportsTab() {
  // Initialize with the last 30 days as the default date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date()
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">التقارير</h2>
      <HRReports 
        dateRange={dateRange} 
        onDateRangeChange={setDateRange}
        selectedEmployeeId={selectedEmployeeId}
        onEmployeeChange={setSelectedEmployeeId}
      />
    </div>
  );
}
