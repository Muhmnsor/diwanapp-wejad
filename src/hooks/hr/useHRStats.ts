
// src/hooks/hr/useHRStats.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define proper typings
export interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface HRStats {
  totalEmployees: number;
  newEmployees: number;
  presentToday: number;
  attendanceRate: number;
  activeLeaves: number;
  upcomingLeaves: number;
  expiringContracts: number;
  pendingTrainings: number;
  employeesByDepartment: ChartDataItem[];
  employeesByContractType: ChartDataItem[];
  leavesByType: ChartDataItem[];
  weeklyAttendanceData: {
    day: string;
    present: number;
    absent: number;
    late: number;
  }[];
  trends: {
    attendance: number[];
    leave: number[];
  };
}

export function useHRStats() {
  return useQuery<HRStats, Error>({
    queryKey: ['hr-stats'],
    queryFn: async () => {
      // Fetch employees count
      const { count: totalEmployees, error: empError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      if (empError) throw empError;

      // Fetch new employees count (hired in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: newEmployees, error: newEmpError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .gte('hire_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (newEmpError) throw newEmpError;

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAttendance, error: attError } = await supabase
        .from('hr_attendance')
        .select('*')
        .eq('attendance_date', today);

      if (attError) throw attError;

      const presentToday = todayAttendance?.filter(a => a.status === 'present').length || 0;
      const attendanceRate = totalEmployees > 0 ? (presentToday / totalEmployees) * 100 : 0;

      // Fetch active leaves
      const { data: activeLeaves, error: leaveError } = await supabase
        .from('hr_leave_requests')
        .select('*')
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today);

      if (leaveError) throw leaveError;

      // Fetch upcoming leaves
      const { data: upcomingLeaves, error: upLeaveError } = await supabase
        .from('hr_leave_requests')
        .select('*')
        .eq('status', 'approved')
        .gt('start_date', today)
        .lte('start_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (upLeaveError) throw upLeaveError;

      // Fetch expiring contracts
      const { data: expiringContracts, error: contractError } = await supabase
        .from('hr_employee_contracts')
        .select('*')
        .eq('status', 'active')
        .lte('end_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .gt('end_date', today);

      if (contractError) throw contractError;

      // Fetch pending trainings
      const { data: pendingTrainings, error: trainingError } = await supabase
        .from('hr_employee_training')
        .select('*')
        .eq('status', 'enrolled');

      if (trainingError) throw trainingError;

      // Fetch departments and employee counts
      const { data: departments, error: deptError } = await supabase
        .from('organizational_units')
        .select('id, name, unit_type')
        .in('unit_type', ['department', 'قسم']);

      if (deptError) throw deptError;

      // Get employees by department
      const COLORS = ['#4ade80', '#facc15', '#f87171', '#60a5fa', '#c084fc', '#fb923c'];
      const deptCountMap: Record<string, number> = {};
      
      // Initialize department counts
      departments.forEach(dept => {
        deptCountMap[dept.name] = 0;
      });
      
      // Get employee-department assignments
      const { data: empDeptAssignments, error: assignError } = await supabase
        .from('employee_organizational_units')
        .select(`
          id, 
          organizational_unit_id,
          employee:employees(id, full_name)
        `)
        .eq('is_primary', true);
        
      if (assignError) throw assignError;
      
      // Count employees by department
      empDeptAssignments.forEach(assignment => {
        if (!assignment.organizational_unit_id || !assignment.employee || !assignment.employee[0]) return;
        
        const dept = departments.find(d => d.id === assignment.organizational_unit_id);
        if (dept) {
          deptCountMap[dept.name] = (deptCountMap[dept.name] || 0) + 1;
        }
      });
      
      const employeesByDepartment: ChartDataItem[] = Object.entries(deptCountMap)
        .filter(([_, count]) => count > 0)
        .map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }));

      // Get employees by contract type
      const { data: employees, error: empTypesError } = await supabase
        .from('employees')
        .select('contract_type');
        
      if (empTypesError) throw empTypesError;
      
      const contractCounts: Record<string, number> = {};
      employees.forEach(emp => {
        if (!emp.contract_type) return;
        
        let contractType = emp.contract_type;
        switch (contractType) {
          case 'full_time': contractType = 'دوام كامل'; break;
          case 'part_time': contractType = 'دوام جزئي'; break;
          case 'contract': contractType = 'تعاقد'; break;
          case 'temporary': contractType = 'مؤقت'; break;
          case 'probation': contractType = 'تجريبي'; break;
        }
        
        contractCounts[contractType] = (contractCounts[contractType] || 0) + 1;
      });
      
      const employeesByContractType: ChartDataItem[] = Object.entries(contractCounts)
        .map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }));

      // Get leaves by type
      const { data: leaveTypes, error: leaveTypesError } = await supabase
        .from('hr_leave_types')
        .select('id, name, color');
        
      if (leaveTypesError) throw leaveTypesError;
      
      const { data: leaves, error: leavesError } = await supabase
        .from('hr_leave_requests')
        .select('leave_type');
        
      if (leavesError) throw leavesError;
      
      const leaveTypeCounts: Record<string, number> = {};
      leaves.forEach(leave => {
        if (!leave.leave_type) return;
        leaveTypeCounts[leave.leave_type] = (leaveTypeCounts[leave.leave_type] || 0) + 1;
      });
      
      const leavesByType: ChartDataItem[] = Object.entries(leaveTypeCounts)
        .map(([name, value], index) => {
          const leaveTypeObj = leaveTypes.find(lt => lt.name === name);
          return {
            name,
            value,
            color: leaveTypeObj?.color || COLORS[index % COLORS.length]
          };
        });

      // Get weekly attendance data
      const weekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Set to beginning of week
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6); // Set to end of week
      
      const { data: weekAttendance, error: weekAttError } = await supabase
        .from('hr_attendance')
        .select('*')
        .gte('attendance_date', weekStart.toISOString().split('T')[0])
        .lte('attendance_date', weekEnd.toISOString().split('T')[0]);
        
      if (weekAttError) throw weekAttError;
      
      const attendanceByDay: Record<string, { present: number; absent: number; late: number }> = {};
      weekdays.forEach(day => {
        attendanceByDay[day] = { present: 0, absent: 0, late: 0 };
      });
      
      weekAttendance?.forEach(att => {
        const date = new Date(att.attendance_date);
        const dayName = weekdays[date.getDay()];
        
        if (att.status === 'present') attendanceByDay[dayName].present += 1;
        else if (att.status === 'absent') attendanceByDay[dayName].absent += 1;
        else if (att.status === 'late') attendanceByDay[dayName].late += 1;
      });
      
      const weeklyAttendanceData = Object.entries(attendanceByDay).map(([day, counts]) => ({
        day,
        ...counts
      }));

      // Mock data for trends
      const trends = {
        attendance: [80, 82, 79, 85, 83, 84, 82],
        leave: [5, 7, 8, 6, 5, 4, 7]
      };

      return {
        totalEmployees: totalEmployees || 0,
        newEmployees: newEmployees || 0,
        presentToday,
        attendanceRate,
        activeLeaves: activeLeaves?.length || 0,
        upcomingLeaves: upcomingLeaves?.length || 0,
        expiringContracts: expiringContracts?.length || 0,
        pendingTrainings: pendingTrainings?.length || 0,
        employeesByDepartment,
        employeesByContractType,
        leavesByType,
        weeklyAttendanceData,
        trends
      };
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
