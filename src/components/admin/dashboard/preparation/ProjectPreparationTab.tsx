import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActivityAttendance } from "@/hooks/attendance/useActivityAttendance";
import { toast } from "sonner";
import { ActivitySelector } from "./ActivitySelector";
import { PreparationContent } from "./PreparationContent";

interface ProjectPreparationTabProps {
  projectId: string;
  activities: any[];
}

export const ProjectPreparationTab = ({ projectId, activities }: ProjectPreparationTabProps) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

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

  const { 
    handleAttendanceChange, 
    handleGroupAttendance 
  } = useActivityAttendance(projectId);

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
      await handleAttendanceChange(registration.id, 'present', selectedActivity);
      refetchAttendance();
      toast.success('تم تسجيل الحضور بنجاح');
    } else {
      toast.error('رقم التسجيل غير موجود');
    }
  };

  const handleGroupAttendanceClick = async (status: 'present' | 'absent') => {
    if (!selectedActivity) {
      toast.error("الرجاء اختيار النشاط أولاً");
      return;
    }
    try {
      console.log('Processing group attendance for activity:', selectedActivity, 'with status:', status);
      await handleGroupAttendance(status, selectedActivity);
      await refetchAttendance();
      toast.success(status === 'present' ? 'تم تحضير جميع المشاركين' : 'تم تغييب جميع المشاركين');
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
            <ActivitySelector
              activities={activities}
              selectedActivity={selectedActivity}
              onActivityChange={setSelectedActivity}
            />
          </div>

          {selectedActivity ? (
            <PreparationContent
              stats={stats}
              onBarcodeScanned={handleBarcodeScanned}
              onGroupAttendance={handleGroupAttendanceClick}
              registrations={registrations}
              attendanceRecords={attendanceRecords}
              onAttendanceChange={async (registrationId, status) => {
                await handleAttendanceChange(registrationId, status, selectedActivity);
                refetchAttendance();
              }}
              totalActivities={activities.length}
            />
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