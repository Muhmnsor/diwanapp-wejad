import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Clock, AlertTriangle, CheckCircle2, Users, CalendarDays } from "lucide-react";

export const AdvancedAnalytics = () => {
  const [activeTab, setActiveTab] = useState("performance");
  const [performanceData, setPerformanceData] = useState([]);
  const [userPerformance, setUserPerformance] = useState([]);
  const [responseTimeTrend, setResponseTimeTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // الألوان للمخططات
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // جلب معلومات المعاملات من Supabase
      const { data: corrData } = await supabase
        .from('correspondence')
        .select('*, correspondence_distribution(*), correspondence_history(*)');
        
      if (!corrData || corrData.length === 0) {
        setLoading(false);
        return;
      }
      
      // تحليل بيانات الأداء
      processPerformanceData(corrData);
      
      // تحليل أداء المستخدمين
      processUserPerformanceData(corrData);
      
      // تحليل اتجاهات وقت الاستجابة
      processResponseTimeTrend(corrData);
      
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // تحليل بيانات الأداء
  const processPerformanceData = (data) => {
    const monthlyData = Array(12).fill(0).map((_, i) => ({
      name: getArabicMonthName(i),
      'تم معالجتها': 0,
      'متأخرة': 0,
      'في الوقت المحدد': 0
    }));
    
    data.forEach(item => {
      if (item.created_at) {
        const date = new Date(item.created_at);
        const month = date.getMonth();
        
        // حساب المعاملات المعالجة
        if (item.status === 'مكتمل' || item.status === 'معتمد') {
          monthlyData[month]['تم معالجتها'] += 1;
          
          // تحديد ما إذا كانت في الوقت المحدد أم متأخرة
          if (item.correspondence_distribution && item.correspondence_distribution.length > 0) {
            const distribution = item.correspondence_distribution[0];
            if (distribution.response_deadline) {
              const deadline = new Date(distribution.response_deadline);
              const completedAt = item.correspondence_history ? 
                item.correspondence_history.find(h => h.action_type === 'status_change' && h.new_status === 'مكتمل')?.action_date : 
                null;
                
              if (completedAt) {
                const completionDate = new Date(completedAt);
                if (completionDate > deadline) {
                  monthlyData[month]['متأخرة'] += 1;
                } else {
                  monthlyData[month]['في الوقت المحدد'] += 1;
                }
              }
            }
          }
        }
      }
    });
    
    setPerformanceData(monthlyData);
  };
  
  // تحليل أداء المستخدمين
  const processUserPerformanceData = async (data) => {
    try {
      // جلب بيانات المستخدمين
      const { data: userData } = await supabase
        .from('profiles')
        .select('id, display_name');
        
      if (!userData) return;
      
      // إنشاء قاموس للمستخدمين
      const userMap = {};
      userData.forEach(user => {
        userMap[user.id] = { 
          name: user.display_name || 'مستخدم غير معروف', 
          completed: 0, 
          assigned: 0, 
          onTime: 0, 
          late: 0 
        };
      });
      
      // تحليل بيانات المعاملات
      data.forEach(item => {
        // حساب المعاملات المعينة
        if (item.assigned_to && userMap[item.assigned_to]) {
          userMap[item.assigned_to].assigned += 1;
          
          // حساب المعاملات المكتملة
          if (item.status === 'مكتمل' || item.status === 'معتمد') {
            userMap[item.assigned_to].completed += 1;
            
            // تحديد الالتزام بالمواعيد
            if (item.correspondence_distribution && item.correspondence_distribution.length > 0) {
              const distribution = item.correspondence_distribution[0];
              if (distribution.response_deadline) {
                const deadline = new Date(distribution.response_deadline);
                const completedAt = item.correspondence_history ? 
                  item.correspondence_history.find(h => h.action_type === 'status_change' && h.new_status === 'مكتمل')?.action_date : 
                  null;
                  
                if (completedAt) {
                  const completionDate = new Date(completedAt);
                  if (completionDate > deadline) {
                    userMap[item.assigned_to].late += 1;
                  } else {
                    userMap[item.assigned_to].onTime += 1;
                  }
                }
              }
            }
          }
        }
      });
      
      // تحويل البيانات إلى مصفوفة
      const userPerformanceData = Object.values(userMap)
        .filter(user => user.assigned > 0) // استبعاد المستخدمين بدون مهام
        .map(user => ({
          name: user.name,
          معينة: user.assigned,
          مكتملة: user.completed,
          'في الوقت': user.onTime,
          متأخرة: user.late,
          'نسبة الإنجاز': user.assigned ? Math.round((user.completed / user.assigned) * 100) : 0,
          'نسبة الالتزام بالمواعيد': user.completed ? Math.round((user.onTime / user.completed) * 100) : 0
        }))
        .sort((a, b) => b['نسبة الإنجاز'] - a['نسبة الإنجاز']);
      
      setUserPerformance(userPerformanceData);
      
    } catch (error) {
      console.error("Error analyzing user performance:", error);
    }
  };
  
  // تحليل اتجاهات وقت الاستجابة
  const processResponseTimeTrend = (data) => {
    // حساب متوسط وقت الاستجابة للمعاملات شهرياً
    const monthlyResponseTime = Array(12).fill(0).map((_, i) => ({
      name: getArabicMonthName(i),
      'متوسط وقت الاستجابة (أيام)': 0,
      'عدد المعاملات': 0
    }));
    
    // حساب وقت الاستجابة لكل معاملة
    data.forEach(item => {
      if (item.created_at && (item.status === 'مكتمل' || item.status === 'معتمد')) {
        const createdAt = new Date(item.created_at);
        const month = createdAt.getMonth();
        
        // البحث عن تاريخ الإكمال في سجل التاريخ
        const completionRecord = item.correspondence_history ? 
          item.correspondence_history.find(h => h.action_type === 'status_change' && h.new_status === 'مكتمل' || h.new_status === 'معتمد') : 
          null;
          
        if (completionRecord) {
          const completedAt = new Date(completionRecord.action_date);
          const responseDays = Math.ceil((completedAt - createdAt) / (1000 * 60 * 60 * 24));
          
          // تحديث متوسط الاستجابة
          monthlyResponseTime[month]['عدد المعاملات'] += 1;
          monthlyResponseTime[month]['متوسط وقت الاستجابة (أيام)'] += responseDays;
        }
      }
    });
    
    // حساب المتوسط
    monthlyResponseTime.forEach(month => {
      if (month['عدد المعاملات'] > 0) {
        month['متوسط وقت الاستجابة (أيام)'] = 
          +(month['متوسط وقت الاستجابة (أيام)'] / month['عدد المعاملات']).toFixed(1);
      }
    });
    
    setResponseTimeTrend(monthlyResponseTime);
  };
  
  // الحصول على أسماء الأشهر بالعربية
  const getArabicMonthName = (monthIndex) => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[monthIndex];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحليل البيانات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="performance">أداء المعاملات</TabsTrigger>
          <TabsTrigger value="userPerformance">أداء المستخدمين</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات والتوقعات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>أداء المعاملات الشهري</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="تم معالجتها" fill="#8884d8" />
                    <Bar dataKey="في الوقت المحدد" fill="#82ca9d" />
                    <Bar dataKey="متأخرة" fill="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>نسبة الالتزام بالمواعيد</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'في الوقت المحدد', value: performanceData.reduce((sum, item) => sum + item['في الوقت المحدد'], 0) },
                          { name: 'متأخرة', value: performanceData.reduce((sum, item) => sum + item['متأخرة'], 0) }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        <Cell fill="#82ca9d" />
                        <Cell fill="#ff7300" />
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} معاملة`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>متوسط وقت المعالجة</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={responseTimeTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="متوسط وقت الاستجابة (أيام)" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="userPerformance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>أداء المستخدمين في معالجة المعاملات</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="معينة" fill="#8884d8" />
                    <Bar dataKey="مكتملة" fill="#82ca9d" />
                    <Bar dataKey="متأخرة" fill="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>نسب الإنجاز والالتزام بالمواعيد</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="نسبة الإنجاز" fill="#8884d8" />
                    <Bar dataKey="نسبة الالتزام بالمواعيد" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>اتجاهات الأعداد الشهرية للمعاملات</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="تم معالجتها" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>متوسط وقت الاستجابة على مدار العام</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={responseTimeTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="متوسط وقت الاستجابة (أيام)" 
                      stroke="#ff7300" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="عدد المعاملات" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

