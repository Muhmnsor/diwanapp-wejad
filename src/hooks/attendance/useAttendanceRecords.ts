import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAttendanceRecords = (projectId: string, selectedActivityId: string | null) => {
  return useQuery({
    queryKey: ['registrations-preparation', projectId, selectedActivityId],
    queryFn: async () => {
      console.log('Fetching registrations for project:', projectId, 'and activity:', selectedActivityId);
      
      if (!selectedActivityId) {
        console.log('No activity selected, returning empty array');
        return [];
      }

      try {
        const { data: registrationsWithAttendance, error: attendanceError } = await supabase
          .from('registrations')
          .select(`
            *,
            attendance_records!inner(*)
          `)
          .eq('project_id', projectId)
          .eq('attendance_records.activity_id', selectedActivityId);

        if (attendanceError) {
          console.error('Error fetching registrations with attendance:', attendanceError);
          throw attendanceError;
        }

        const { data: allRegistrations, error: regError } = await supabase
          .from('registrations')
          .select('*')
          .eq('project_id', projectId);

        if (regError) {
          console.error('Error fetching all registrations:', regError);
          throw regError;
        }

        const mappedRegistrations = allRegistrations.map(reg => {
          const matchingReg = registrationsWithAttendance?.find(d => d.id === reg.id);
          return {
            ...reg,
            attendance_records: matchingReg ? matchingReg.attendance_records : []
          };
        });

        console.log('Mapped registrations:', mappedRegistrations);
        return mappedRegistrations || [];
      } catch (error) {
        console.error('Error in useAttendanceRecords:', error);
        toast.error('حدث خطأ في جلب بيانات التسجيل');
        return [];
      }
    },
    enabled: !!projectId && !!selectedActivityId
  });
};