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
}

export const PreparationContent = ({
  stats,
  onBarcodeScanned,
  onGroupAttendance,
  registrations,
  attendanceRecords,
  onAttendanceChange
}: PreparationContentProps) => {
  return (
    <>
      <AttendanceStats stats={stats} />
      <AttendanceControls
        onBarcodeScanned={onBarcodeScanned}
        onGroupAttendance={onGroupAttendance}
      />
      <AttendanceTable
        registrations={registrations.map(registration => ({
          ...registration,
          attendance_records: attendanceRecords.filter(
            record => record.registration_id === registration.id
          )
        }))}
        onAttendanceChange={onAttendanceChange}
      />
    </>
  );
};