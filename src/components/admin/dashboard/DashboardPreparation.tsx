import { useEffect, useState } from "react";
import { AttendanceStats } from "./preparation/AttendanceStats";
import { AttendanceControls } from "./preparation/AttendanceControls";
import { AttendanceTable } from "./preparation/AttendanceTable";
import { useAttendanceManagement } from "@/hooks/useAttendanceManagement";
import { ProjectActivity } from "@/types/activity";

interface DashboardPreparationProps {
  projectId: string;
  activities: ProjectActivity[];
}

export const DashboardPreparation = ({ projectId, activities }: DashboardPreparationProps) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  
  const {
    registrations,
    isLoading,
    attendanceStats,
    setAttendanceStats,
    handleAttendance,
    handleBarcodeScanned,
    handleGroupAttendance
  } = useAttendanceManagement(projectId, selectedActivityId);

  useEffect(() => {
    // Calculate attendance statistics
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-2">
          اختر النشاط
        </label>
        <select
          id="activity"
          className="w-full p-2 border rounded-md"
          value={selectedActivityId || ''}
          onChange={(e) => setSelectedActivityId(e.target.value || null)}
        >
          <option value="">اختر النشاط</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.title}
            </option>
          ))}
        </select>
      </div>
      
      {selectedActivityId ? (
        <>
          <AttendanceControls 
            onBarcodeScanned={handleBarcodeScanned}
            onGroupAttendance={handleGroupAttendance}
          />
          <AttendanceStats stats={attendanceStats} />
          <AttendanceTable 
            registrations={registrations} 
            onAttendanceChange={handleAttendance}
          />
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          الرجاء اختيار نشاط للبدء في التحضير
        </div>
      )}
    </div>
  );
};