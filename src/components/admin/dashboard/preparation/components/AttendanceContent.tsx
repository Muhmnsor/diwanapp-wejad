import { useEffect } from "react";
import { toast } from "sonner";
import { AttendanceStats } from "../AttendanceStats";
import { AttendanceControls } from "../AttendanceControls";
import { AttendanceTable } from "../AttendanceTable";
import { AttendanceStatsType } from "@/hooks/attendance/types";

interface AttendanceContentProps {
  registrations: any[];
  attendanceStats: AttendanceStatsType;
  setAttendanceStats: (stats: AttendanceStatsType) => void;
  handleAttendanceChange: (registrationId: string, status: 'present' | 'absent') => Promise<void>;
  handleGroupAttendance: (status: 'present' | 'absent') => Promise<void>;
  refetch: () => Promise<void>;
}

export const AttendanceContent = ({
  registrations,
  attendanceStats,
  setAttendanceStats,
  handleAttendanceChange,
  handleGroupAttendance,
  refetch
}: AttendanceContentProps) => {
  const handleBarcodeScanned = async (code: string) => {
    try {
      console.log('Scanning barcode:', code);
      const registration = registrations.find(r => r.registration_number === code);
      if (registration) {
        await handleAttendanceChange(registration.id, 'present');
        await refetch();
        toast.success('تم تسجيل الحضور بنجاح');
      } else {
        toast.error('رقم التسجيل غير موجود');
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast.error('حدث خطأ في تسجيل الحضور');
    }
  };

  const handleIndividualAttendanceChange = async (registrationId: string, status: 'present' | 'absent') => {
    try {
      console.log('Updating attendance:', { registrationId, status });
      await handleAttendanceChange(registrationId, status);
      await refetch();
      toast.success(status === 'present' ? 'تم تسجيل الحضور بنجاح' : 'تم تسجيل الغياب بنجاح');
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('حدث خطأ في تحديث الحضور');
    }
  };

  const handleGroupAttendanceWithRefresh = async (status: 'present' | 'absent') => {
    try {
      console.log('Processing group attendance with status:', status);
      await handleGroupAttendance(status);
      await refetch();
      toast.success(status === 'present' ? 'تم تحضير جميع المشاركين' : 'تم تغييب جميع المشاركين');
    } catch (error) {
      console.error('Error in group attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور الجماعي');
    }
  };

  useEffect(() => {
    const stats = {
      total: registrations.length,
      present: 0,
      absent: 0,
      notRecorded: 0
    };

    registrations.forEach(registration => {
      const attendanceRecord = registration.attendance_records?.[0];
      if (!attendanceRecord) {
        stats.notRecorded++;
      } else if (attendanceRecord.status === 'present') {
        stats.present++;
      } else if (attendanceRecord.status === 'absent') {
        stats.absent++;
      }
    });

    setAttendanceStats(stats);
  }, [registrations, setAttendanceStats]);

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      <AttendanceControls 
        onBarcodeScanned={handleBarcodeScanned}
        onGroupAttendance={handleGroupAttendanceWithRefresh}
      />
      <AttendanceStats stats={attendanceStats} />
      <AttendanceTable 
        registrations={registrations} 
        onAttendanceChange={handleIndividualAttendanceChange}
      />
    </div>
  );
};