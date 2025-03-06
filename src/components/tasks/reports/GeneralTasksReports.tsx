
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const GeneralTasksReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [statusStats, setStatusStats] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchGeneralTasksStats = async () => {
      setIsLoading(true);
      try {
        // Fetch general tasks
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('is_general', true);
          
        if (error) {
          console.error("Error fetching general tasks for reports:", error);
          return;
        }
        
        // Calculate stats by category
        const categoryCounts: Record<string, number> = {};
        data.forEach(task => {
          const category = task.category || 'أخرى';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        const categoryStatsData = Object.entries(categoryCounts).map(([name, count]) => ({
          name,
          count
        }));
        
        // Calculate stats by status
        const statusCounts: Record<string, number> = {
          'pending': 0,
          'in_progress': 0,
          'completed': 0,
          'delayed': 0
        };
        
        data.forEach(task => {
          const status = task.status || 'pending';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        const statusLabels: Record<string, string> = {
          'pending': 'قيد الانتظار',
          'in_progress': 'قيد التنفيذ',
          'completed': 'مكتملة',
          'delayed': 'متأخرة'
        };
        
        const statusStatsData = Object.entries(statusCounts).map(([status, count]) => ({
          name: statusLabels[status] || status,
          value: count,
          status
        }));
        
        setCategoryStats(categoryStatsData);
        setStatusStats(statusStatsData);
      } catch (error) {
        console.error("Error calculating general tasks stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGeneralTasksStats();
  }, []);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border">
        <CardHeader>
          <h3 className="text-lg font-semibold">تقرير المهام العامة</h3>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="category">
            <TabsList className="mb-4">
              <TabsTrigger value="category">حسب التصنيف</TabsTrigger>
              <TabsTrigger value="status">حسب الحالة</TabsTrigger>
            </TabsList>
            
            <TabsContent value="category">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} مهمة`, 'العدد']} />
                    <Legend />
                    <Bar dataKey="count" name="عدد المهام" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="status">
              <div className="h-80 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
