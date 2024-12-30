import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStats } from "./AttendanceStats";
import { AttendanceControls } from "./AttendanceControls";
import { AttendanceTable } from "./AttendanceTable";
import { toast } from "sonner";

interface ProjectPreparationTabProps {
  projectId: string;
  activities: any[];
}

export const ProjectPreparationTab = ({ projectId, activities }: ProjectPreparationTabProps) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  // Fetch project registrations
  const { data: registrations = [] } = useQuery({
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

  // Calculate attendance stats
  const stats = {
    total: registrations.length,
    present: attendanceRecords.filter(record => record.status === 'present').length,
    absent: attendanceRecords.filter(record => record.status === 'absent').length,
    notRecorded: registrations.length - attendanceRecords.length
  };

  const handleAttendanceChange = async (registrationId: string, status: 'present' | 'absent') => {
    if (!selectedActivity) {
      toast.error("الرجاء اختيار النشاط أولاً");
      return;
    }

    try {
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('registration_id', registrationId)
        .eq('activity_id', selectedActivity)
        .maybeSingle();

      if (existingRecord) {
        await supabase
          .from('attendance_records')
          .update({
            status,
            check_in_time: status === 'present' ? new Date().toISOString() : null
          })
          .eq('id', existingRecord.id);
      } else {
        await supabase
          .from('attendance_records')
          .insert({
            registration_id: registrationId,
            activity_id: selectedActivity,
            project_id: projectId,
            status,
            check_in_time: status === 'present' ? new Date().toISOString() : null
          });
      }

      toast.success(status === 'present' ? 'تم تسجيل الحضور' : 'تم تسجيل الغياب');
      refetchAttendance();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور');
    }
  };

  const handleBarcodeScanned = async (code: string) => {
    if (!selectedActivity) {
      toast.error("الرجاء اختيار النشاط أولاً");
      return;
    }

    const registration = registrations.find(r => r.registration_number === code);
    if (registration) {
      await handleAttendanceChange(registration.id, 'present');
    } else {
      toast.error('رقم التسجيل غير موجود');
    }
  };

  const handleGroupAttendance = async (status: 'present' | 'absent') => {
    if (!selectedActivity) {
      toast.error("الرجاء اختيار النشاط أولاً");
      return;
    }

    try {
      for (const registration of registrations) {
        const hasAttendance = attendanceRecords.some(
          record => record.registration_id === registration.id
        );

        if (!hasAttendance) {
          await supabase
            .from('attendance_records')
            .insert({
              registration_id: registration.id,
              activity_id: selectedActivity,
              project_id: projectId,
              status,
              check_in_time: status === 'present' ? new Date().toISOString() : null
            });
        }
      }

      toast.success(status === 'present' ? 'تم تسجيل حضور الجميع' : 'تم تسجيل غياب الجميع');
      refetchAttendance();
    } catch (error) {
      console.error('Error in group attendance:', error);
      toast.error('حدث خطأ في تسجيل الحضور الجماعي');
    }
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
                onGroupAttendance={handleGroupAttendance}
              />
              <AttendanceTable
                registrations={registrations.map(registration => ({
                  ...registration,
                  attendance_records: attendanceRecords.filter(
                    record => record.registration_id === registration.id
                  )
                }))}
                onAttendanceChange={handleAttendanceChange}
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