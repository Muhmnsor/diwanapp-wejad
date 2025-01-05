import { useEffect } from "react";
import { AttendanceStats } from "./AttendanceStats";
import { AttendanceControls } from "./AttendanceControls";
import { AttendanceTable } from "./AttendanceTable";
import { useProjectAttendance } from "@/hooks/attendance/useProjectAttendance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectActivityAttendanceTabProps {
  projectId: string;
  activityId: string;
}

export const ProjectActivityAttendanceTab = ({ projectId, activityId }: ProjectActivityAttendanceTabProps) => {
  const { data: registrations = [], isLoading, refetch } = useQuery({
    queryKey: ['project-activity-registrations', projectId, activityId],
    queryFn: async () => {
      console.log('Fetching registrations for project activity:', { projectId, activityId });
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          attendance_records(*)
        `)
        .eq('project_id', projectId);

      if (error) throw error;
      console.log('Fetched project registrations:', data);
      return data || [];
    },
  });

  const {
    attendanceStats,
    setAttendanceStats,
    handleAttendanceChange,
    handleGroupAttendance
  } = useProjectAttendance(projectId);

  const handleBarcodeScanned = async (code: string) => {
    try {
      console.log('Scanning barcode for project activity:', { projectId, activityId, code });
      const registration = registrations.find(r => r.registration_number === code);
      if (registration) {
        await handleAttendanceChange(registration.id, 'present', activityId);
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
      console.log('Updating individual attendance for registration:', registrationId, 'with status:', status);
      await handleAttendanceChange(registrationId, status, activityId);
      await refetch();
      toast.success(status === 'present' ? 'تم تسجيل الحضور بنجاح' : 'تم تسجيل الغياب بنجاح');
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('حدث خطأ في تحديث الحضور');
    }
  };

  const handleGroupAttendanceWithRefresh = async (status: 'present' | 'absent') => {
    try {
      console.log('Processing group attendance for project activity:', { projectId, activityId, status });
      await handleGroupAttendance(status, activityId);
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
      const attendanceRecord = registration.attendance_records?.find(
        record => record.activity_id === activityId
      );
      
      if (!attendanceRecord) {
        stats.notRecorded++;
      } else if (attendanceRecord.status === 'present') {
        stats.present++;
      } else if (attendanceRecord.status === 'absent') {
        stats.absent++;
      }
    });

    setAttendanceStats(stats);
  }, [registrations, setAttendanceStats, activityId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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