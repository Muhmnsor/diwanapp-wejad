
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Task, Workspace } from '@/types/workspace';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, getMonth, getYear, isWithinInterval, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TasksYearlyPlan = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  
  // تاريخ اليوم للعلامة الحالية
  const today = new Date();

  // جلب البيانات الافتراضية للمساحات والمهام
  useEffect(() => {
    // هذه بيانات تجريبية، ستُستبدل بجلب البيانات الفعلية من قاعدة البيانات
    const demoWorkspaces: Workspace[] = [
      {
        id: '1',
        name: 'مساحة العمل الرئيسية',
        description: 'المساحة الرئيسية للمشاريع الاستراتيجية',
        status: 'active',
        created_at: new Date().toISOString(),
        total_tasks: 12,
        completed_tasks: 5,
        pending_tasks: 7,
      },
      {
        id: '2',
        name: 'تطوير المنتجات',
        description: 'مساحة خاصة بتطوير المنتجات الجديدة',
        status: 'active',
        created_at: new Date().toISOString(),
        total_tasks: 8,
        completed_tasks: 3,
        pending_tasks: 5,
      },
      {
        id: '3',
        name: 'المشاريع التعليمية',
        description: 'مساحة للمشاريع التعليمية والتدريبية',
        status: 'active',
        created_at: new Date().toISOString(),
        total_tasks: 5,
        completed_tasks: 2,
        pending_tasks: 3,
      }
    ];
    
    // إنشاء مهام تجريبية للعام الحالي
    const demoTasks: Task[] = [];
    
    // إضافة مهام موزعة على مدار العام
    for (let i = 0; i < 20; i++) {
      const randomMonth = Math.floor(Math.random() * 12);
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const randomDuration = Math.floor(Math.random() * 14) + 3; // مدة المهمة من 3 إلى 16 يوم
      const randomWorkspace = demoWorkspaces[Math.floor(Math.random() * demoWorkspaces.length)];
      
      const startDate = new Date(year, randomMonth, randomDay);
      const endDate = new Date(year, randomMonth, randomDay + randomDuration);
      
      demoTasks.push({
        id: `task-${i+1}`,
        title: `مهمة ${i+1}`,
        description: `وصف المهمة رقم ${i+1}`,
        status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)] as 'pending' | 'in_progress' | 'completed',
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        due_date: endDate.toISOString(),
        created_at: new Date(year, randomMonth, randomDay - 5).toISOString(),
        workspace_id: randomWorkspace.id,
        workspace_name: randomWorkspace.name,
        start_date: startDate.toISOString(), // إضافة تاريخ البداية
        end_date: endDate.toISOString() // إضافة تاريخ النهاية
      });
    }
    
    setWorkspaces(demoWorkspaces);
    setTasks(demoTasks);
  }, [year]);

  // الحصول على مصفوفة من الأشهر للعام المحدد
  const getMonthsOfYear = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(startOfMonth(new Date(year, i, 1)));
    }
    return months;
  };

  // تعامل مع تغيير السنة
  const handleYearChange = (yearDelta: number) => {
    setYear(prevYear => prevYear + yearDelta);
  };

  // التحقق مما إذا كانت المهمة تقع في نطاق تاريخ معين
  const isTaskInDay = (task: Task, date: Date) => {
    if (!task.start_date || !task.end_date) return false;
    
    const taskStartDate = new Date(task.start_date);
    const taskEndDate = new Date(task.end_date);
    
    return isWithinInterval(date, { start: taskStartDate, end: taskEndDate }) ||
           isSameDay(date, taskStartDate) ||
           isSameDay(date, taskEndDate);
  };

  // الحصول على مهام المساحة في يوم معين
  const getWorkspaceTasksForDay = (workspaceId: string, date: Date) => {
    return tasks.filter(task => task.workspace_id === workspaceId && isTaskInDay(task, date));
  };

  // الحصول على لون حالة المهمة
  const getTaskStatusColor = (status: string) => {
    switch(status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-amber-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الخطة السنوية {year}</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => handleYearChange(-1)}
            className="flex items-center gap-1"
          >
            <ChevronRight className="h-4 w-4" />
            السنة السابقة
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => handleYearChange(1)}
            className="flex items-center gap-1"
          >
            السنة التالية
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-4 overflow-auto">
        <div className="min-w-[1200px]">
          {/* رأس الجدول مع أسماء الأشهر */}
          <div className="flex border-b pb-2">
            <div className="w-48 flex-shrink-0 font-bold">مساحة العمل</div>
            <div className="flex-1 flex">
              {getMonthsOfYear().map((month, index) => (
                <div 
                  key={index} 
                  className="flex-1 text-center font-medium text-sm"
                >
                  {format(month, 'MMMM', { locale: ar })}
                </div>
              ))}
            </div>
          </div>

          {/* محتوى مخطط جانت لكل مساحة عمل */}
          <div className="mt-4 space-y-6">
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="space-y-2">
                <div className="flex">
                  <div className="w-48 flex-shrink-0 font-medium">
                    {workspace.name}
                  </div>
                  <div className="flex-1 flex">
                    {getMonthsOfYear().map((month, monthIndex) => {
                      const daysInMonth = eachDayOfInterval({
                        start: startOfMonth(month),
                        end: endOfMonth(month)
                      });
                      
                      return (
                        <div key={monthIndex} className="flex-1 relative">
                          <div className="flex h-8 border-r">
                            {daysInMonth.map((day, dayIndex) => (
                              <div 
                                key={dayIndex} 
                                className={`flex-1 h-full ${
                                  isSameDay(day, today) ? 'bg-yellow-100' : ''
                                }`}
                              />
                            ))}
                          </div>
                          
                          {/* المهام الموزعة على أيام الشهر */}
                          <div className="relative h-8 mt-1">
                            {tasks
                              .filter(task => task.workspace_id === workspace.id)
                              .map(task => {
                                if (!task.start_date || !task.end_date) return null;
                                
                                const startDate = new Date(task.start_date);
                                const endDate = new Date(task.end_date);
                                
                                // فحص ما إذا كانت المهمة تقع في هذا الشهر
                                if (
                                  (getMonth(startDate) !== monthIndex && getMonth(endDate) !== monthIndex) &&
                                  !(getMonth(startDate) < monthIndex && getMonth(endDate) > monthIndex)
                                ) {
                                  return null;
                                }
                                
                                // حساب موضع وعرض شريط المهمة
                                let left = 0;
                                let width = 0;
                                
                                if (getMonth(startDate) < monthIndex) {
                                  // المهمة تبدأ قبل هذا الشهر
                                  left = 0;
                                } else {
                                  // المهمة تبدأ في هذا الشهر
                                  left = (startDate.getDate() - 1) / daysInMonth.length * 100;
                                }
                                
                                if (getMonth(endDate) > monthIndex) {
                                  // المهمة تنتهي بعد هذا الشهر
                                  width = 100 - left;
                                } else {
                                  // المهمة تنتهي في هذا الشهر
                                  width = (endDate.getDate() / daysInMonth.length * 100) - left;
                                }
                                
                                return (
                                  <div
                                    key={task.id}
                                    style={{
                                      left: `${left}%`,
                                      width: `${width}%`,
                                    }}
                                    className={`absolute h-6 rounded-md px-1 text-xs text-white flex items-center overflow-hidden ${getTaskStatusColor(task.status)}`}
                                    title={`${task.title} (${task.priority === 'high' ? 'مرتفعة' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'})`}
                                  >
                                    <span className="truncate">{task.title}</span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">وسائل الإيضاح</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-green-500"></div>
            <span>مكتملة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-blue-500"></div>
            <span>قيد التنفيذ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-amber-500"></div>
            <span>قيد الانتظار</span>
          </div>
        </div>
      </div>
    </div>
  );
};
