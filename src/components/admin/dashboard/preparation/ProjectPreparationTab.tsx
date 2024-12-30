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
  const [selectedRegistration, setSelectedRegistration] = useState<string | null>(null);
  const [mode, setMode] = useState<'activity' | 'registrant'>('activity');

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
    queryKey: ['activity-attendance', selectedActivity, selectedRegistration, mode],
    queryFn: async () => {
      console.log("Fetching attendance records for:", mode === 'activity' ? 'activity' : 'registrant');
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('project_id', projectId)
        .eq(mode === 'activity' ? 'activity_id' : 'registration_id', 
            mode === 'activity' ? selectedActivity : selectedRegistration);

      if (error) throw error;
      console.log("Fetched attendance records:", data);
      return data || [];
    },
    enabled: mode === 'activity' ? !!selectedActivity : !!selectedRegistration,
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
    if (mode === 'activity' && !selectedActivity) {
      toast.error("الرجاء اختيار النشاط أولاً");
      return;
    }

    const registration = registrations.find(r => r.registration_number === code);
    if (registration) {
      if (mode === 'activity') {
        await handleAttendanceChange(registration.id, 'present', selectedActivity!);
      } else {
        // Handle registrant mode attendance
        const activitiesToUpdate = activities.map(a => a.id);
        for (const activityId of activitiesToUpdate) {
          await handleAttendanceChange(registration.id, 'present', activityId);
        }
      }
      refetchAttendance();
      toast.success('تم تسجيل الحضور بنجاح');
    } else {
      toast.error('رقم التسجيل غير موجود');
    }
  };

  const handleGroupAttendanceClick = async (status: 'present' | 'absent') => {
    if (mode === 'activity' && !selectedActivity) {
      toast.error("الرجاء اختيار النشاط أولاً");
      return;
    }
    try {
      if (mode === 'activity') {
        console.log('Processing group attendance for activity:', selectedActivity, 'with status:', status);
        await handleGroupAttendance(status, selectedActivity!);
      } else {
        // Handle registrant mode group attendance
        const activitiesToUpdate = activities.map(a => a.id);
        for (const activityId of activitiesToUpdate) {
          await handleGroupAttendance(status, activityId);
        }
      }
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
              registrations={registrations}
              selectedActivity={selectedActivity}
              selectedRegistration={selectedRegistration}
              onActivityChange={setSelectedActivity}
              onRegistrationChange={setSelectedRegistration}
              mode={mode}
              onModeChange={setMode}
            />
          </div>

          {(mode === 'activity' ? selectedActivity : selectedRegistration) ? (
            <PreparationContent
              stats={stats}
              onBarcodeScanned={handleBarcodeScanned}
              onGroupAttendance={handleGroupAttendanceClick}
              registrations={registrations}
              attendanceRecords={attendanceRecords}
              onAttendanceChange={async (registrationId, status) => {
                if (mode === 'activity') {
                  await handleAttendanceChange(registrationId, status, selectedActivity!);
                } else {
                  // Handle registrant mode attendance change
                  const activitiesToUpdate = activities.map(a => a.id);
                  for (const activityId of activitiesToUpdate) {
                    await handleAttendanceChange(registrationId, status, activityId);
                  }
                }
                refetchAttendance();
              }}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {mode === 'activity' ? 
                'الرجاء اختيار النشاط لعرض قائمة التحضير' : 
                'الرجاء اختيار المستفيد لعرض قائمة التحضير'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};