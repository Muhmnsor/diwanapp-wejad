
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalTasksStats } from "./components/PersonalTasksStats";
import { PersonalProductivityChart } from "./components/PersonalProductivityChart";
import { TaskCompletionTimeChart } from "./components/TaskCompletionTimeChart";
import { TasksStatusDistribution } from "./components/TasksStatusDistribution";
import { PersonalPerformanceStats } from "./components/PersonalPerformanceStats";
import { DelayTimeChart } from "./components/DelayTimeChart";
import { OnTimeCompletionChart } from "./components/OnTimeCompletionChart";
import { Skeleton } from "@/components/ui/skeleton";
import { usePersonalTasksStats } from "./hooks/usePersonalTasksStats";
import { UserSelector } from "./components/UserSelector";
import { DateRangePicker } from "./components/DateRangePicker";
import { useAuthStore } from "@/store/refactored-auth";
import { supabase } from "@/integrations/supabase/client";
import { ExportButton } from "./components/ExportButton";
import { PersonalReportData } from "@/utils/reports/exportPersonalReport";

export const PersonalTasksReports = () => {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'quarterly' | 'custom'>('monthly');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  });
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  
  // Check if the current user is an admin
  useEffect(() => {
    if (!user?.id) return;
    
    const checkAdminStatus = async () => {
      const { data, error } = await fetch('/api/check-admin-status')
        .then(res => res.json())
        .catch(() => ({ data: null, error: 'Failed to fetch admin status' }));
      
      if (!error && data?.isAdmin) {
        setIsAdmin(true);
      }
    };
    
    // Alternative method using Supabase directly
    const checkAdminRoles = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*, roles(name)')
        .eq('user_id', user.id);
      
      if (!error && data) {
        const isUserAdmin = data.some(role => 
          role.roles?.name === 'admin' || role.roles?.name === 'app_admin'
        );
        setIsAdmin(isUserAdmin);
      }
    };
    
    checkAdminRoles();
  }, [user]);
  
  // Fetch selected user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = selectedUserId || user?.id;
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('email, display_name')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setUserName(data.display_name || "");
        setUserEmail(data.email || "");
      }
    };
    
    fetchUserInfo();
  }, [selectedUserId, user]);
  
  const { data, isLoading } = usePersonalTasksStats(
    period, 
    selectedUserId,
    period === 'custom' ? {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString()
    } : undefined
  );
  
  // Prepare export data
  const getExportData = (): PersonalReportData => {
    let periodText = "";
    
    switch(period) {
      case "weekly":
        periodText = "أسبوعي";
        break;
      case "monthly":
        periodText = "شهري";
        break;
      case "quarterly":
        periodText = "ربع سنوي";
        break;
      case "custom":
        periodText = `${dateRange.startDate.toLocaleDateString('ar-SA')} إلى ${dateRange.endDate.toLocaleDateString('ar-SA')}`;
        break;
    }
    
    return {
      userName: userName || (user?.user_metadata?.name as string || "المستخدم"),
      userEmail: userEmail || (user?.email as string || ""),
      period: periodText,
      tasksStats: data.tasksStats,
      performanceStats: data.performanceStats
    };
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-lg font-medium">التقارير الشخصية</h3>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 rtl:space-x-reverse w-full md:w-auto gap-2">
          {isAdmin && (
            <div className="w-full md:w-64">
              <UserSelector 
                value={selectedUserId || user?.id || ''} 
                onChange={setSelectedUserId} 
              />
            </div>
          )}
          
          <select 
            className="px-3 py-1 border rounded-md text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'weekly' | 'monthly' | 'quarterly' | 'custom')}
          >
            <option value="weekly">أسبوعي</option>
            <option value="monthly">شهري</option>
            <option value="quarterly">ربع سنوي</option>
            <option value="custom">مخصص</option>
          </select>
          
          {period === 'custom' && (
            <div className="w-full md:w-64">
              <DateRangePicker 
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          )}
          
          <div className="w-full md:w-auto">
            <ExportButton data={getExportData()} />
          </div>
        </div>
      </div>
      
      {/* Task Statistics Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium">إحصائيات المهام الشخصية</h4>
        <PersonalTasksStats stats={data.tasksStats} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">توزيع المهام حسب الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <TasksStatusDistribution data={data.statusDistribution} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">إنتاجية العمل الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonalProductivityChart data={data.monthlyProductivity} />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">متوسط وقت إنجاز المهام (بالأيام)</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskCompletionTimeChart data={data.completionTime} />
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Statistics Section */}
      <div className="space-y-6 mt-10 pt-10 border-t">
        <h4 className="text-lg font-medium">إحصائيات الأداء الشخصي</h4>
        <PersonalPerformanceStats stats={data.performanceStats} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">متوسط وقت التأخير (بالأيام)</CardTitle>
            </CardHeader>
            <CardContent>
              <DelayTimeChart data={data.delayTime} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">المهام المنجزة قبل/بعد الموعد</CardTitle>
            </CardHeader>
            <CardContent>
              <OnTimeCompletionChart data={data.onTimeCompletion} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
