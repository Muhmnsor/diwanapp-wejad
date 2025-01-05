import { AttendanceStats, AttendanceRecord } from "@/hooks/attendance/types";
import { AttendanceTable } from "../AttendanceTable";
import { AttendanceControls } from "../AttendanceControls";
import { AttendanceStatsDisplay } from "../AttendanceStats";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AttendanceContentProps {
  stats: AttendanceStats;
  records: AttendanceRecord[];
  error: Error | null;
  onRefresh: () => Promise<void>;
}

export const AttendanceContent = ({
  stats,
  records,
  error,
  onRefresh
}: AttendanceContentProps) => {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          حدث خطأ أثناء تحميل بيانات الحضور
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <AttendanceStatsDisplay stats={stats} />
      <AttendanceControls onRefresh={onRefresh} />
      <AttendanceTable records={records} />
    </div>
  );
};