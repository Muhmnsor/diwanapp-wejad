import { AttendanceStats as AttendanceStatsType } from "@/hooks/attendance/types";
import { AttendanceTable } from "../AttendanceTable";
import { AttendanceControls } from "../AttendanceControls";
import { AttendanceStats } from "../AttendanceStats";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AttendanceContentProps {
  stats: AttendanceStatsType;
  records: any[];
  error: Error | null;
  onRefresh: () => Promise<void>;
  onBarcodeScanned: (code: string) => Promise<void>;
  onGroupAttendance: (status: 'present' | 'absent') => Promise<void>;
  onAttendanceChange: (registrationId: string, status: 'present' | 'absent') => Promise<void>;
}

export const AttendanceContent = ({
  stats,
  records,
  error,
  onRefresh,
  onBarcodeScanned,
  onGroupAttendance,
  onAttendanceChange
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
      <AttendanceStats stats={stats} />
      <AttendanceControls 
        onBarcodeScanned={onBarcodeScanned}
        onGroupAttendance={onGroupAttendance}
      />
      <AttendanceTable 
        registrations={records}
        onAttendanceChange={onAttendanceChange}
      />
    </div>
  );
};