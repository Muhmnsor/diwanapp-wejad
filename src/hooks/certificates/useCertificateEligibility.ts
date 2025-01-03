import { supabase } from "@/integrations/supabase/client";

interface EligibilityParams {
  registrationId: string;
  eventId?: string;
  projectId?: string;
}

export const useCertificateEligibility = () => {
  const checkEligibility = async ({ registrationId, eventId, projectId }: EligibilityParams) => {
    console.log('Checking eligibility for:', { registrationId, eventId, projectId });

    try {
      // Get attendance records
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('registration_id', registrationId);

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
        throw attendanceError;
      }

      // Get event or project details
      let requiredAttendance = 0;
      let requiredPercentage = 0;

      if (eventId) {
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) {
          console.error('Error fetching event:', eventError);
          throw eventError;
        }

        requiredAttendance = 1; // For single events
        requiredPercentage = 100; // Must attend the event
      } else if (projectId) {
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError) {
          console.error('Error fetching project:', projectError);
          throw projectError;
        }

        requiredAttendance = project.required_activities_count || 0;
        requiredPercentage = project.required_attendance_percentage || 0;
      }

      // Calculate attendance metrics
      const totalAttendance = attendanceRecords?.filter(record => record.status === 'present').length || 0;
      const attendancePercentage = (totalAttendance / requiredAttendance) * 100;

      // Check if already has a certificate
      const { data: existingCertificate, error: certificateError } = await supabase
        .from('certificates')
        .select('id')
        .match({
          registration_id: registrationId,
          ...(eventId ? { event_id: eventId } : {}),
          ...(projectId ? { project_id: projectId } : {})
        })
        .single();

      if (certificateError && certificateError.code !== 'PGRST116') {
        console.error('Error checking existing certificate:', certificateError);
        throw certificateError;
      }

      if (existingCertificate) {
        return {
          isEligible: false,
          reason: "تم إصدار شهادة مسبقاً",
          requirements: {
            totalAttendance,
            requiredAttendance,
            attendancePercentage,
            requiredPercentage
          }
        };
      }

      // Check eligibility
      const isEligible = totalAttendance >= requiredAttendance && attendancePercentage >= requiredPercentage;

      return {
        isEligible,
        reason: isEligible ? undefined : "لم يتم استيفاء متطلبات الحضور",
        requirements: {
          totalAttendance,
          requiredAttendance,
          attendancePercentage,
          requiredPercentage
        }
      };
    } catch (error) {
      console.error('Error in checkEligibility:', error);
      throw error;
    }
  };

  return {
    checkEligibility
  };
};