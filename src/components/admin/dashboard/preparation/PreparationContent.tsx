import { FC } from "react";
import { AttendanceStats } from "./AttendanceStats";
import { AttendanceControls } from "./AttendanceControls";
import { AttendanceTable } from "./AttendanceTable";

interface PreparationContentProps {
  stats: {
    total: number;
    present: number;
    absent: number;
    notRecorded: number;
  };
  onBarcodeScanned: (code: string) => Promise<void>;
  onGroupAttendance: (status: 'present' | 'absent') => Promise<void>;
  registrations: any[];
  attendanceRecords: any[];
  onAttendanceChange: (registrationId: string, status: 'present' | 'absent') => Promise<void>;
  totalActivities: number;
}

export const PreparationContent: FC<PreparationContentProps> = ({
  stats,
  onBarcodeScanned,
  onGroupAttendance,
  registrations,
  attendanceRecords,
  onAttendanceChange,
  totalActivities
}) => {
  return (
    <div className="space-y-6">
      <AttendanceStats stats={stats} />
      <AttendanceControls
        onBarcodeScanned={onBarcodeScanned}
        onGroupAttendance={onGroupAttendance}
      />
      <AttendanceTable
        registrations={registrations}
        onAttendanceChange={onAttendanceChange}
        totalActivities={totalActivities}
      />
    </div>
  );
};