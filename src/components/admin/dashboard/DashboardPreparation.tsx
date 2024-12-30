import { useEffect, useState } from "react";
import { AttendanceStats } from "./preparation/AttendanceStats";
import { AttendanceControls } from "./preparation/AttendanceControls";
import { AttendanceTable } from "./preparation/AttendanceTable";
import { useAttendanceManagement } from "@/hooks/useAttendanceManagement";
import { ProjectActivity } from "@/types/activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DashboardPreparationProps {
  projectId: string;
  activities: ProjectActivity[];
}

interface ProjectStats {
  totalActivities: number;
  unrecordedActivities: number;
  totalAttendance: number;
  totalAbsence: number;
  averageAttendance: number;
}

export const DashboardPreparation = ({ projectId, activities }: DashboardPreparationProps) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalActivities: 0,
    unrecordedActivities: 0,
    totalAttendance: 0,
    totalAbsence: 0,
    averageAttendance: 0
  });
  
  const {
    registrations,
    isLoading,
    attendanceStats,
    setAttendanceStats,
    handleAttendance,
    handleBarcodeScanned,
    handleGroupAttendance,
    fetchActivityAttendance
  } = useAttendanceManagement(projectId, selectedActivityId);

  useEffect(() => {
    const calculateProjectStats = async () => {
      let totalPresent = 0;
      let totalAbsent = 0;
      let activitiesWithAttendance = 0;

      // Calculate attendance for each activity
      for (const activity of activities) {
        const activityAttendance = await fetchActivityAttendance(activity.id);
        if (activityAttendance.total > 0) {
          activitiesWithAttendance++;
          totalPresent += activityAttendance.present;
          totalAbsent += activityAttendance.absent;
        }
      }

      const totalActivities = activities.length;
      const unrecordedActivities = totalActivities - activitiesWithAttendance;
      const totalRecords = totalPresent + totalAbsent;
      const averageAttendance = totalRecords > 0 
        ? (totalPresent / totalRecords) * 100 
        : 0;

      setProjectStats({
        totalActivities,
        unrecordedActivities,
        totalAttendance: totalPresent,
        totalAbsence: totalAbsent,
        averageAttendance
      });
    };

    calculateProjectStats();
  }, [activities, fetchActivityAttendance]);

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
    <div className="space-y-6">
      {/* Project Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأنشطة غير المحضرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.unrecordedActivities}</div>
            <p className="text-xs text-muted-foreground">
              من أصل {projectStats.totalActivities} نشاط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط نسبة الحضور</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectStats.averageAttendance.toFixed(1)}%
            </div>
            <Progress 
              value={projectStats.averageAttendance} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الحضور والغياب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projectStats.totalAttendance + projectStats.totalAbsence}
            </div>
            <p className="text-xs text-muted-foreground">
              حضور: {projectStats.totalAttendance} | غياب: {projectStats.totalAbsence}
            </p>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
};