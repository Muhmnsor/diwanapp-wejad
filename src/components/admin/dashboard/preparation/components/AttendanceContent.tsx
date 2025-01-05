import { AttendanceStats } from "@/hooks/attendance/types";
import { AttendanceTable } from "../AttendanceTable";
import { AttendanceControls } from "../AttendanceControls";
import { AttendanceStats as AttendanceStatsComponent } from "../AttendanceStats";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AttendanceContentProps {
  stats: AttendanceStats;
  records: any[];
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
      <AttendanceStatsComponent stats={stats} />
      <AttendanceControls 
        onBarcodeScanned={async () => {}} 
        onGroupAttendance={async () => {}}
      />
      <AttendanceTable 
        registrations={records}
        onAttendanceChange={async () => {}}
      />
    </div>
  );
};