import { supabase } from "@/integrations/supabase/client";

interface AttendanceRequirement {
  type: 'percentage' | 'count';
  value: number;
}

export interface CertificateRequirements {
  projectId?: string;
  eventId?: string;
  registrationId: string;
  attendanceRequirement?: AttendanceRequirement;
}

export const checkCertificateEligibility = async ({
  projectId,
  eventId,
  registrationId,
  attendanceRequirement
}: CertificateRequirements) => {
  try {
    console.log('Checking certificate eligibility for:', { projectId, eventId, registrationId });

    // التحقق من وجود التسجيل
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (registrationError || !registration) {
      console.error('Registration not found:', registrationError);
      return {
        isEligible: false,
        reason: 'التسجيل غير موجود'
      };
    }

    // التحقق من سجلات الحضور
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('registration_id', registrationId)
      .eq('status', 'present');

    if (attendanceError) {
      console.error('Error fetching attendance records:', attendanceError);
      return {
        isEligible: false,
        reason: 'خطأ في التحقق من سجلات الحضور'
      };
    }

    // التحقق من متطلبات الحضور إذا كانت محددة
    if (attendanceRequirement) {
      const totalAttendance = attendanceRecords.length;

      if (attendanceRequirement.type === 'percentage') {
        // حساب النسبة المئوية للحضور
        const { data: totalActivities } = await supabase
          .from('events')
          .select('count')
          .eq(projectId ? 'project_id' : 'id', projectId || eventId)
          .single();

        const totalCount = totalActivities?.count || 0;
        const attendancePercentage = (totalAttendance / totalCount) * 100;

        if (attendancePercentage < attendanceRequirement.value) {
          return {
            isEligible: false,
            reason: `نسبة الحضور (${attendancePercentage.toFixed(1)}%) أقل من المطلوب (${attendanceRequirement.value}%)`
          };
        }
      } else if (attendanceRequirement.type === 'count') {
        if (totalAttendance < attendanceRequirement.value) {
          return {
            isEligible: false,
            reason: `عدد مرات الحضور (${totalAttendance}) أقل من المطلوب (${attendanceRequirement.value})`
          };
        }
      }
    }

    // التحقق من صلاحية المشروع/الفعالية
    const table = projectId ? 'projects' : 'events';
    const id = projectId || eventId;

    const { data: entity, error: entityError } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (entityError || !entity) {
      console.error(`${table} not found:`, entityError);
      return {
        isEligible: false,
        reason: 'المشروع/الفعالية غير موجود'
      };
    }

    if (!entity.certificate_type || entity.certificate_type === 'none') {
      return {
        isEligible: false,
        reason: 'الشهادات غير متاحة لهذا المشروع/الفعالية'
      };
    }

    // التحقق من عدم إصدار شهادة سابقة
    const { data: existingCertificate, error: certificateError } = await supabase
      .from('certificates')
      .select('id')
      .eq('registration_id', registrationId)
      .single();

    if (existingCertificate) {
      return {
        isEligible: false,
        reason: 'تم إصدار شهادة مسبقاً'
      };
    }

    // المشارك مؤهل للحصول على الشهادة
    return {
      isEligible: true,
      reason: 'مؤهل للحصول على الشهادة'
    };

  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    return {
      isEligible: false,
      reason: 'حدث خطأ أثناء التحقق من الأهلية'
    };
  }
};