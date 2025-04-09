import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Clock, FileText, Send, Archive, Download, Filter } from "lucide-react";

interface DashboardProps {
  onFilterChange: (filter: any) => void;
}

export const CorrespondenceDashboard: React.FC<DashboardProps> = ({ onFilterChange }) => {
  const [stats, setStats] = useState({
    total: 0,
    incoming: 0,
    outgoing: 0,
    letters: 0,
    pending: 0,
    completed: 0,
    distribution: 0,
    late: 0
  });
  
  const [statusData, setStatusData] = useState<any[]>([]);
  const [typeData, setTypeData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // إحصائيات أعداد المعاملات
      const { data: corrData } = await supabase
        .from('correspondence')
        .select('*');
        
      if (corrData) {
        const incoming = corrData.filter(item => item.type === 'incoming').length;
        const outgoing = corrData.filter(item => item.type === 'outgoing').length;
        const letters = corrData.filter(item => item.type === 'letter').length;
        const pending = corrData.filter(item => 
          item.status === 'قيد المعالجة' || 
          item.status === 'قيد الإعداد' || 
          item.status === 'مسودة'
        ).length;
        const completed = corrData.filter(item => 
          item.status === 'مكتمل' || 
          item.status === 'مرسل' || 
          item.status === 'معتمد'
        ).length;
        
        setStats({
          total: corrData.length,
          incoming,
          outgoing,
          letters,
          pending,
          completed,
          distribution: 0, // سيتم تحديثه لاحقاً
          late: 0 // سيتم تحديثه لاحقاً
        });
        
        // بيانات المخطط الدائري للحالات
        const statusCounts: {[key: string]: number} = {};
        corrData.forEach(item => {
          statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
        });
        
        setStatusData(
          Object.keys(statusCounts).map(status => ({
            name: status,
            value: statusCounts[status]
          }))
        );
        
        // بيانات المخطط الدائري للأنواع
        setTypeData([
          { name: 'وارد', value: incoming },
          { name: 'صادر', value: outgoing },
          { name: 'خطاب', value: letters },
        ]);
        
        // بيانات المخطط الشهري
        const monthlyCounts: {[key: string]: {incoming: number, outgoing: number}} = {};
        const currentYear = new Date().getFullYear();
        
        corrData.forEach(item => {
          if (!item.date) return;
          
          const date = new Date(item.date);
          if (date.getFullYear() !== currentYear) return;
          
          const month = date.getMonth();
          if (!monthlyCounts[month]) {
            monthlyCounts[month] = { incoming: 0, outgoing: 0 };
          }
          
          if (item.type === 'incoming') {
            monthlyCounts[month].incoming += 1;
          } else if (item.type === 'outgoing') {
            monthlyCounts[month].outgoing += 1;
          }
        });
        
        const monthNames = [
          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        
        setMonthlyData(
          Object.keys(monthlyCounts).map(month => ({
            name: monthNames[parseInt(month)],
            وارد: monthlyCounts[parseInt(month)].incoming,
            صادر: monthlyCounts[parseInt(month)].outgoing
          }))
        );
      }
      
      // إحصائيات التوزيع
      const { data: distData } = await supabase
        .from('correspondence_distribution')
        .select('*');
        
      if (distData) {
        const now = new Date();
        const late = distData.filter(item => {
          if (!item.response_deadline) return false;
          if (item.status === 'مكتمل') return false;
          
          const deadline = new Date(item.response_deadline);
          return deadline < now;
        }).length;
        
        setStats(prev => ({
          ...prev,
          distribution: distData.length,
          late
        }));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // الألوان للمخططات
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const STATUS_COLORS: {[key: string]: string} = {
    'قيد المعالجة': '#FFBB28',
    'مكتمل': '#00C49F',
    'معلق': '#8884d8',
    'مرسل': '#0088FE',
    'قيد الإعداد': '#82ca9d',
    'معتمد': '#00C49F',
    'مسودة': '#FF8042'
  };

  return (
    <div className="space-y-6">
      {/* إحصائيات المعاملات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-blue-700">إجمالي المعاملات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{stats.total}</div>
            <div className="mt-1 flex justify-between text-sm text-blue-600">
              <span>وارد: {stats.incoming}</span>
              <span>صادر: {stats.outgoing}</span>
              <span>خطابات: {stats.letters}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-yellow-700">قيد المعالجة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="mt-1 flex items-center text-sm text-yellow-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>بانتظار الإكمال</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-green-700">تم إكمالها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{stats.completed}</div>
            <div className="mt-1 flex items-center text-sm text-green-600">
              <FileText className="h-4 w-4 mr-1" />
              <span>معاملات مكتملة</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-red-700">طلبات متأخرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{stats.late}</div>
            <div className="mt-1 flex items-center text-sm text-red-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>تجاوزت الموعد النهائي</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* مخططات المعاملات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزيع المعاملات حسب النوع</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} معاملة`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-blue-700 border-blue-200 hover:bg-blue-50"
                onClick={() => onFilterChange({ type: 'incoming' })}
              >
                <Archive className="h-4 w-4 ml-1" />
                الوارد
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-green-700 border-green-200 hover:bg-green-50"
                onClick={() => onFilterChange({ type: 'outgoing' })}
              >
                <Send className="h-4 w-4 ml-1" />
                الصادر
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                onClick={() => onFilterChange({ type: 'letter' })}
              >
                <FileText className="h-4 w-4 ml-1" />
                الخطابات
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>توزيع المعاملات حسب الحالة</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {statusData.map((entry) => (
                        <Cell 
                          key={`cell-${entry.name}`} 
                          fill={STATUS_COLORS[entry.name] || COLORS[0]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} معاملة`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                onClick={() => onFilterChange({ status: 'قيد المعالجة' })}
              >
                <Clock className="h-4 w-4 ml-1" />
                قيد المعالجة
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-green-700 border-green-200 hover:bg-green-50"
                onClick={() => onFilterChange({ status: 'مكتمل' })}
              >
                <FileText className="h-4 w-4 ml-1" />
                مكتمل
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* مخطط التوزيع الشهري */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع المعاملات شهرياً</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="وارد" fill="#0088FE" />
                  <Bar dataKey="صادر" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onFilterChange({ dateRange: 'year' })}
            >
              <Filter className="h-4 w-4 ml-1" />
              تصفية حسب العام الحالي
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* زر تحديث البيانات */}
      <div className="flex justify-center">
        <Button onClick={fetchDashboardData}>
          <span>تحديث البيانات</span>
        </Button>
      </div>
    </div>
  );
};

