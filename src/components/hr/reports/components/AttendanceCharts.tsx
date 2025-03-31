
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface AttendanceChartsProps {
  data: {
    stats: {
      totalRecords: number;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      leaveCount: number;
      presentPercentage: number;
      absentPercentage: number;
      latePercentage: number;
      leavePercentage: number;
    };
    employeeStats?: { employee_name: string; present: number; absent: number; late: number; leave: number }[];
  };
}

export function AttendanceCharts({ data }: AttendanceChartsProps) {
  const { stats, employeeStats } = data;
  
  // Prepare data for pie chart
  const pieData = [
    { name: 'حاضر', value: stats.presentCount, color: '#10b981' },
    { name: 'غائب', value: stats.absentCount, color: '#ef4444' },
    { name: 'متأخر', value: stats.lateCount, color: '#f59e0b' },
    { name: 'إجازة', value: stats.leaveCount, color: '#6b7280' },
  ];
  
  // Prepare data for bar chart if employee stats available
  const barData = employeeStats?.map(empStat => ({
    name: empStat.employee_name,
    حاضر: empStat.present,
    غائب: empStat.absent,
    متأخر: empStat.late,
    إجازة: empStat.leave,
  })) || [];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'عدد السجلات']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {barData.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="حاضر" fill="#10b981" />
              <Bar dataKey="غائب" fill="#ef4444" />
              <Bar dataKey="متأخر" fill="#f59e0b" />
              <Bar dataKey="إجازة" fill="#6b7280" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
