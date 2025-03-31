
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface LeaveChartsProps {
  data: {
    stats: {
      totalRequests: number;
      approvedCount: number;
      rejectedCount: number;
      pendingCount: number;
      totalDays: number;
      approvedPercentage: number;
      rejectedPercentage: number;
      pendingPercentage: number;
    };
    leaveTypeStats?: { leave_type: string; count: number; days: number }[];
    employeeStats?: { employee_name: string; count: number; days: number }[];
  };
}

export function LeaveCharts({ data }: LeaveChartsProps) {
  const { stats, leaveTypeStats, employeeStats } = data;
  
  // Prepare data for pie chart
  const pieData = [
    { name: 'موافق', value: stats.approvedCount, color: '#10b981' },
    { name: 'مرفوض', value: stats.rejectedCount, color: '#ef4444' },
    { name: 'قيد الانتظار', value: stats.pendingCount, color: '#f59e0b' },
  ];
  
  // Prepare data for leave types bar chart
  const leaveTypeData = leaveTypeStats?.map(stat => ({
    name: stat.leave_type,
    عدد: stat.count,
    أيام: stat.days,
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
            <Tooltip formatter={(value) => [value, 'عدد الطلبات']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {leaveTypeData.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leaveTypeData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="عدد" fill="#10b981" />
              <Bar dataKey="أيام" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
