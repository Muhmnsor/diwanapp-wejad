
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface EmployeeChartsProps {
  data: {
    stats: {
      totalEmployees: number;
      activeCount: number;
      departmentCount: number;
      positionCount: number;
      byDepartment?: { name: string; count: number }[];
      byPosition?: { name: string; count: number }[];
      byContractType?: { name: string; count: number }[];
    };
  };
}

export function EmployeeCharts({ data }: EmployeeChartsProps) {
  const { stats } = data;
  
  // Prepare department data for bar chart
  const departmentData = stats.byDepartment?.map(dept => ({
    name: dept.name || 'غير محدد',
    عدد: dept.count,
  })) || [];
  
  // Prepare contract type data for pie chart
  const contractTypeData = stats.byContractType?.map(contract => ({
    name: contract.name || 'غير محدد',
    value: contract.count,
    color: getColorForIndex(contract.name),
  })) || [];
  
  // Function to generate color based on contract type
  function getColorForIndex(name: string): string {
    const colorMap: Record<string, string> = {
      'دوام كامل': '#10b981',
      'دوام جزئي': '#6366f1',
      'متعاقد': '#f59e0b',
      'مؤقت': '#ef4444',
    };
    
    return colorMap[name] || '#6b7280';
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {departmentData.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="عدد" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {contractTypeData.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={contractTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {contractTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'عدد الموظفين']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
