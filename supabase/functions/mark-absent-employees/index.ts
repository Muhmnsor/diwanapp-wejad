
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

export const markAbsentEmployees = async () => {
  console.log('Starting automatic absence marking process');
  
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0: الأحد, 1: الاثنين, ..., 6: السبت
  const dateString = today.toISOString().split('T')[0];
  
  console.log(`Processing for date: ${dateString}, day of week: ${dayOfWeek}`);

  // Get all active employees with their schedules
  const { data: employees, error: employeesError } = await supabase
    .from('employees')
    .select(`
      id,
      full_name,
      schedule_id,
      default_schedule_id
    `)
    .eq('status', 'active');

  if (employeesError) {
    console.error('Error fetching employees:', employeesError);
    throw employeesError;
  }

  console.log(`Found ${employees?.length || 0} active employees`);

  for (const employee of employees || []) {
    console.log(`Processing employee: ${employee.full_name} (ID: ${employee.id})`);
    
    const scheduleId = employee.schedule_id || employee.default_schedule_id;

    if (!scheduleId) {
      console.warn(`No schedule defined for employee: ${employee.full_name} (ID: ${employee.id})`);
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
      console.error(`Error querying work days for employee ${employee.full_name} (ID: ${employee.id}) with schedule ${scheduleId}:`, workDayError);
      continue;
    }

    if (!workDay?.is_working_day) {
      console.log(`Today is not a working day for employee ${employee.full_name} (ID: ${employee.id})`);
      continue;
    }

    // Check if attendance record exists for today
    const { data: attendance, error: attendanceError } = await supabase
      .from('hr_attendance')
      .select('*')
      .eq('employee_id', employee.id)
      .eq('attendance_date', dateString);

    if (attendanceError) {
      console.error(`Error querying attendance for employee ${employee.full_name} (ID: ${employee.id}) on date ${dateString}:`, attendanceError);
      continue;
    }

    // If no attendance record exists, mark as absent
    if (!attendance || attendance.length === 0) {
      console.log(`No attendance record found for ${employee.full_name} (ID: ${employee.id}), marking as absent`);
      
      const { error: insertError } = await supabase
        .from('hr_attendance')
        .insert({
          employee_id: employee.id,
          attendance_date: dateString,
          status: 'absent',
          notes: 'تم تسجيل الغياب تلقائياً',
          created_by: null,
        });

      if (insertError) {
        console.error(`Error marking absence for employee ${employee.full_name} (ID: ${employee.id}):`, insertError);
      } else {
        console.log(`Successfully marked employee ${employee.full_name} (ID: ${employee.id}) as absent`);
      }
    } else {
      console.log(`Attendance record already exists for ${employee.full_name} (ID: ${employee.id}) on ${dateString}`);
    }
  }
  
  console.log('Automatic absence marking process completed');
};

// Handler for when the function is invoked directly via HTTP request
Deno.serve(async (req) => {
  try {
    console.log('Mark absent employees function invoked');
    await markAbsentEmployees();
    return new Response(
      JSON.stringify({ success: true, message: 'Absent employees marked successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in mark-absent-employees function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
