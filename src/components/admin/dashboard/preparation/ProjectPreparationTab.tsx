import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStats } from "./AttendanceStats";
import { AttendanceControls } from "./AttendanceControls";
import { AttendanceTable } from "./AttendanceTable";
import { useAttendanceManagement } from "@/hooks/useAttendanceManagement";
import { toast } from "sonner";

interface ProjectPreparationTabProps {
  projectId: string;
  activities: any[];
}

export const ProjectPreparationTab = ({ projectId, activities }: ProjectPreparationTabProps) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  // Fetch project registrations
  const { data: registrations = [], refetch: refetchRegistrations } = useQuery({
    queryKey: ['project-registrations', projectId],
    queryFn: async () => {
      console.log("Fetching project registrations for:", projectId);
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          attendance_records(*)
        `)
        .eq('project_id', projectId);

      if (error) throw error;
      console.log("Fetched registrations:", data);
      return data || [];
    },
    enabled: !!projectId,
  });

  // Fetch attendance records for selected activity
  const { data: attendanceRecords = [], refetch: refetchAttendance } = useQuery({
    queryKey: ['activity-attendance', selectedActivity],
    queryFn: async () => {
      console.log("Fetching attendance records for activity:", selectedActivity);
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('activity_id', selectedActivity)
        .eq('project_id', projectId);

      if (error) throw error;
      console.log("Fetched attendance records:", data);
      return data || [];
    },
    enabled: !!selectedActivity,
  });

  const { handleAttendanceChange, handleGroupAttendance } = useAttendanceManagement(projectId);

  // Calculate attendance stats
  const stats = {
    total: registrations.length,
    present: attendanceRecords.filter(record => record.status === 'present').length,
    absent: attendanceRecords.filter(record => record.status === 'absent').length,
    notRecorded: registrations.length - attendanceRecords.length
  };

  const handleBarcodeScanned = async (code: string) => {
    if (!selectedActivity) {
      toast.error("الرجاء اختيار النشاط أولاً");
      return;
    }

    const registration = registrations.find(r => r.registration_number === code);
    if (registration) {
      await handleAttendanceChange(registration.id, 'present');
      refetchAttendance();
    } else {
      toast.error('رقم التسجيل غير موجود');
    }
  };

  const handleGroupAttendanceClick = async (status: 'present' | 'absent') => {
    if (!selectedActivity) {
      toast.error("الرجاء اختيار النشاط أولاً");
      return;
    }
    await handleGroupAttendance(status);
    refetchAttendance();
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            لا توجد أنشطة مضافة لهذا المشروع
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">تحضير الأنشطة</h2>
            <Select
              value={selectedActivity || ""}
              onValueChange={(value) => setSelectedActivity(value)}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="اختر النشاط" />
              </SelectTrigger>
              <SelectContent>
                {activities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedActivity ? (
            <>
              <AttendanceStats stats={stats} />
              <AttendanceControls
                onBarcodeScanned={handleBarcodeScanned}
                onGroupAttendance={handleGroupAttendanceClick}
              />
              <AttendanceTable
                registrations={registrations.map(registration => ({
                  ...registration,
                  attendance_records: attendanceRecords.filter(
                    record => record.registration_id === registration.id
                  )
                }))}
                onAttendanceChange={async (registrationId, status) => {
                  await handleAttendanceChange(registrationId, status);
                  refetchAttendance();
                }}
              />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              الرجاء اختيار النشاط لعرض قائمة التحضير
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};