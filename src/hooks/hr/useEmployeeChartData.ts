// src/hooks/hr/useEmployeeChartData.ts
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface EmployeeChartData {
  departmentDistribution: ChartData[];
  contractTypeDistribution: ChartData[];
}

const COLORS = ['#4ade80', '#facc15', '#f87171', '#60a5fa', '#c084fc', '#fb923c'];

export function useEmployeeChartData(department: "all" | "engineering" | "marketing" | "hr") {
  return useQuery<EmployeeChartData, Error>({
    queryKey: ['employee-chart-data', department],
    queryFn: async () => {
      // 1. اجلب كل الموظفين حسب القسم المطلوب
      const employeeQuery = supabase.from('employees').select('*');
      
      if (department !== "all") {
        let deptName;
        switch (department) {
          case "engineering": deptName = "الهندسة"; break;
          case "marketing": deptName = "التسويق"; break;
          case "hr": deptName = "الموارد البشرية"; break;
        }
        employeeQuery.eq('department', deptName);
      }
      
      const { data: employees, error } = await employeeQuery;
      
      if (error) throw error;
      
      // 2. احصائيات توزيع الأقسام
      const departmentCounts: Record<string, number> = {};
      
      // اجمع كل الأقسام الموجودة
      employees.forEach(emp => {
        if (!emp.department) return;
        
        departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
      });
      
      // حول البيانات إلى التنسيق المطلوب للرسم البياني
      const departmentDistribution = Object.entries(departmentCounts).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }));
      
      // 3. احصائيات أنواع العقود
      const contractCounts: Record<string, number> = {};
      
      // اجمع كل أنواع العقود
      employees.forEach(emp => {
        if (!emp.contract_type) return;
        
        let contractType = emp.contract_type;
        // ترجمة أنواع العقود
        switch (contractType) {
          case 'full_time': contractType = 'دوام كامل'; break;
          case 'part_time': contractType = 'دوام جزئي'; break;
          case 'contract': contractType = 'تعاقد'; break;
        }
        
        contractCounts[contractType] = (contractCounts[contractType] || 0) + 1;
      });
      
      // حول البيانات إلى التنسيق المطلوب للرسم البياني
      const contractTypeDistribution = Object.entries(contractCounts).map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }));
      
      return {
        departmentDistribution,
        contractTypeDistribution
      };
    },
    refetchInterval: 5 * 60 * 1000, // تحديث كل 5 دقائق
  });
}

