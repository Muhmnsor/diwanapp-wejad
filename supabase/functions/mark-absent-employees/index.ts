import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

export const markAbsentEmployees = async () => {
  // **تحسين:** تم إزالة هذا الاستعلام لأنه لا يستخدم في الكود الحالي
  // const { data: workSchedules } = await supabase
  //   .from('hr_work_schedules')
  //   .select('*');

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0: الأحد, 1: الاثنين, ..., 6: السبت

  // Get all active employees with their schedules
  const { data: employees } = await supabase
    .from('employees')
    .select(`
      id,
      schedule_id,
      default_schedule_id
    `)
    .eq('status', 'active');

  for (const employee of employees || []) {
    const scheduleId = employee.schedule_id || employee.default_schedule_id;

    if (!scheduleId) {
      console.warn(`لا يوجد جدول عمل محدد للموظف برقم التعريف: ${employee.id}`);
      continue;
    }

    // Check if today is a working day for this employee
    const { data: workDay, error: workDayError } = await supabase
      .from('hr_work_days')
      .select('*')
      .eq('schedule_id', scheduleId)
      .eq('day_of_week', dayOfWeek)
      .single();

    if (workDayError) {
      console.error(`خطأ في استعلام أيام العمل للموظف ${employee.id} وجدول العمل ${scheduleId}:`, workDayError);
      continue;
    }

    if (!workDay?.is_working_day) {
      // اليوم ليس يوم عمل لهذا الموظف، لذا ننتقل إلى الموظف التالي
      continue;
    }

    // Check if attendance record exists for today
    const { data: attendance, error: attendanceError } = await supabase
      .from('hr_attendance')
      .select('*')
      .eq('employee_id', employee.id)
      .eq('attendance_date', today.toISOString().split('T')[0])
      .single();

    if (attendanceError) {
      console.error(`خطأ في استعلام الحضور للموظف ${employee.id} بتاريخ ${today.toISOString().split('T')[0]}:`, attendanceError);
      continue;
    }

    // If no attendance record exists, mark as absent
    if (!attendance) {
      const { error: insertError } = await supabase
        .from('hr_attendance')
        .insert({
          employee_id: employee.id,
          attendance_date: today.toISOString().split('T')[0],
          status: 'absent',
          notes: 'تم تسجيل الغياب تلقائياً',
          created_by: null, // **ملاحظة:** قد تحتاج إلى تحديد المستخدم الذي قام بهذا الإجراء إذا كان ذلك مهمًا
        });

      if (insertError) {
        console.error(`خطأ في تسجيل الغياب للموظف ${employee.id}:`, insertError);
      } else {
        console.log(`تم تسجيل غياب الموظف ${employee.id} تلقائيًا.`);
      }
    }
  }
};
