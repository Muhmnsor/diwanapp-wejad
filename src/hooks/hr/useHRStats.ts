// الكود الحالي يستخدم بيانات تجريبية للعديد من الإحصائيات
// تحديث الدالة لجلب البيانات الفعلية

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HRStats {
  totalEmployees: number;
  newEmployees: number;
  presentToday: number;
  attendanceRate: number;
  activeLeaves: number;
  upcomingLeaves: number;
  expiringContracts: number;
  pendingTrainings: number;
  urgentTasks: number;
  expiringContractDetails: {
    id: string;
    employeeName: string;
    expiryDate: string;
    daysRemaining: number;
    contractType: string;
  }[];
  employeesByDepartment: { name: string; value: number }[];
  employeesByContractType: { name: string; value: number }[];
  weeklyAttendanceData: {
    name: string;
    present: number;
    late: number;
    absent: number;
  }[];
  leavesByType: { name: string; value: number }[];
  trends: {
    employeeTrend: number[];
    attendanceTrend: number[];
    leaveTrend: number[];
    contractsTrend: number[];
    trainingTrend: number[];
    tasksTrend: number[];
  };
}

export function useHRStats() {
  return useQuery<HRStats, Error>({
    queryKey: ['hr-stats'],
    queryFn: async () => {
      // التاريخ الحالي
      const today = new Date().toISOString().split('T')[0];
      
      // استرداد عدد الموظفين الكلي
      const { count: totalEmployees, error: countError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
        
      if (countError) throw countError;
      
      // استرداد الموظفين الجدد (في آخر 30 يومًا)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newEmployees, error: newEmpError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .gte('hire_date', thirtyDaysAgo.toISOString().split('T')[0]);
        
      if (newEmpError) throw newEmpError;
      
      // استرداد الحضور اليوم
      const { count: presentToday, error: presentError } = await supabase
        .from('hr_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('attendance_date', today)
        .eq('status', 'present');
        
      if (presentError) throw presentError;
      
      // استرداد إجمالي عدد الموظفين النشطين لحساب معدل الحضور
      const { count: activeEmployees, error: activeEmpError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
        
      if (activeEmpError) throw activeEmpError;
      
      // حساب معدل الحضور
      const attendanceRate = activeEmployees ? Math.round((presentToday / activeEmployees) * 100) : 0;
      
      // استرداد الإجازات النشطة اليوم
      const { count: activeLeaves, error: leavesError } = await supabase
        .from('hr_leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today);
        
      if (leavesError) throw leavesError;
      
      // استرداد الإجازات القادمة
      const { count: upcomingLeaves, error: upcomingLeavesError } = await supabase
        .from('hr_leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gt('start_date', today);
        
      if (upcomingLeavesError) throw upcomingLeavesError;
      
      // استرداد العقود المنتهية قريبًا (في آخر 30 يومًا)
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      
      const { count: expiringContracts, error: contractsError } = await supabase
        .from('hr_employee_contracts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lte('end_date', thirtyDaysLater.toISOString().split('T')[0])
        .gte('end_date', today);
        
      if (contractsError) throw contractsError;
      
      // استرداد تفاصيل العقود المنتهية قريبًا
      const { data: contractDetails, error: detailsError } = await supabase
        .from('hr_employee_contracts')
        .select(`
          id,
          end_date,
          contract_type,
          employees:employee_id (full_name)
        `)
        .eq('status', 'active')
        .lte('end_date', thirtyDaysLater.toISOString().split('T')[0])
        .gte('end_date', today)
        .order('end_date');
        
      if (detailsError) throw detailsError;
      
      // تحويل بيانات العقود إلى التنسيق المطلوب
      const expiringContractDetails = contractDetails.map(contract => {
        const currentDate = new Date();
        const expiryDate = new Date(contract.end_date);
        const daysRemaining = Math.ceil((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: contract.id,
          employeeName: contract.employees?.full_name || 'غير معروف',
          expiryDate: contract.end_date,
          daysRemaining,
          contractType: contract.contract_type
        };
      });
      
      // استرداد توزيع الموظفين حسب الإدارات
      const { data: departmentData, error: deptError } = await supabase
        .from('employees')
        .select('department');
        
      if (deptError) throw deptError;
      
      // جمع البيانات حسب الإدارات
      const departmentGroups = departmentData.reduce((acc, curr) => {
        if (curr.department) {
          acc[curr.department] = (acc[curr.department] || 0) + 1;
        }
        return acc;
      }, {});
      
      // تحويل بيانات الإدارات إلى التنسيق المطلوب
      const employeesByDepartment = Object.entries(departmentGroups).map(([name, value]) => ({ name, value }));
      
      // استرداد توزيع الموظفين حسب نوع العقد
      const { data: contractTypeData, error: contractTypeError } = await supabase
        .from('employees')
        .select('contract_type');
        
      if (contractTypeError) throw contractTypeError;
      
      // جمع البيانات حسب نوع العقد
      const contractTypeGroups = contractTypeData.reduce((acc, curr) => {
        if (curr.contract_type) {
          let label = '';
          switch(curr.contract_type) {
            case 'full_time': label = 'دوام كامل'; break;
            case 'part_time': label = 'دوام جزئي'; break;
            case 'contractor': label = 'متعاقد'; break;
            default: label = curr.contract_type;
          }
          acc[label] = (acc[label] || 0) + 1;
        }
        return acc;
      }, {});
      
      // تحويل بيانات نوع العقد إلى التنسيق المطلوب
      const employeesByContractType = Object.entries(contractTypeGroups).map(([name, value]) => ({ name, value }));
      
      // استرداد بيانات الحضور لآخر أسبوع
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const { data: weeklyAttendance, error: weeklyAttendanceError } = await supabase
        .from('hr_attendance')
        .select('attendance_date, status')
        .gte('attendance_date', lastWeek.toISOString().split('T')[0]);
        
      if (weeklyAttendanceError) throw weeklyAttendanceError;
      
      // أيام الأسبوع بالعربية
      const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      
      // جمع بيانات الحضور الأسبوعية
      const weeklyStats = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = weekDays[date.getDay()];
        const dateStr = date.toISOString().split('T')[0];
        
        // تهيئة البيانات
        weeklyStats[dateStr] = {
          name: dayName,
          present: 0,
          late: 0,
          absent: 0
        };
      }
      
      // ملء بيانات الحضور
      weeklyAttendance.forEach(record => {
        const dateStr = record.attendance_date;
        if (weeklyStats[dateStr]) {
          if (record.status === 'present') {
            weeklyStats[dateStr].present++;
          } else if (record.status === 'late') {
            weeklyStats[dateStr].late++;
          } else if (record.status === 'absent') {
            weeklyStats[dateStr].absent++;
          }
        }
      });
      
      // تحويل بيانات الحضور الأسبوعية إلى التنسيق المطلوب
      const weeklyAttendanceData = Object.values(weeklyStats);
      
      // استرداد بيانات الإجازات حسب النوع
      const { data: leaveTypesData, error: leaveTypesError } = await supabase
        .from('hr_leave_requests')
        .select('leave_type');
        
      if (leaveTypesError) throw leaveTypesError;
      
      // جمع بيانات الإجازات حسب النوع
      const leaveTypeGroups = leaveTypesData.reduce((acc, curr) => {
        if (curr.leave_type) {
          acc[curr.leave_type] = (acc[curr.leave_type] || 0) + 1;
        }
        return acc;
      }, {});
      
      // تحويل بيانات الإجازات إلى التنسيق المطلوب
      const leavesByType = Object.entries(leaveTypeGroups).map(([name, value]) => ({ name, value }));
      
      // بناء كائن الإحصائيات النهائي
      return {
        totalEmployees: totalEmployees || 0,
        newEmployees: newEmployees || 0,
        presentToday: presentToday || 0,
        attendanceRate: attendanceRate,
        activeLeaves: activeLeaves || 0,
        upcomingLeaves: upcomingLeaves || 0,
        expiringContracts: expiringContracts || 0,
        pendingTrainings: 0, // هذه البيانات تتطلب جداول إضافية
        urgentTasks: 0, // هذه البيانات تتطلب جداول إضافية
        expiringContractDetails,
        employeesByDepartment,
        employeesByContractType,
        weeklyAttendanceData,
        leavesByType,
        trends: {
          // هذه البيانات تتطلب تحليلًا أكثر تعقيدًا عبر الوقت
          employeeTrend: [0, 0, 0, 0, 0, 0, 0],
          attendanceTrend: [0, 0, 0, 0, 0, 0, 0],
          leaveTrend: [0, 0, 0, 0, 0, 0, 0],
          contractsTrend: [0, 0, 0, 0, 0, 0, 0],
          trainingTrend: [0, 0, 0, 0, 0, 0, 0],
          tasksTrend: [0, 0, 0, 0, 0, 0, 0]
        }
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function getTrendDirection(data: number[]) {
  if (!data || data.length < 2) return 'neutral';
  
  const lastValue = data[data.length - 1];
  const previousValue = data[data.length - 2];
  
  if (lastValue > previousValue) return 'up';
  if (lastValue < previousValue) return 'down';
  return 'neutral';
}

export function getTrendPercentage(data: number[]) {
  if (!data || data.length < 2) return 0;
  
  const lastValue = data[data.length - 1];
  const previousValue = data[data.length - 2];
  
  if (previousValue === 0) return 0; // Avoid division by zero
  
  const percentageChange = Math.abs(((lastValue - previousValue) / previousValue) * 100);
  return Math.round(percentageChange);
}
