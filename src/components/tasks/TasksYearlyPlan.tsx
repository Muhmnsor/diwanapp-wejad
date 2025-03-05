import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Task, Workspace } from '@/types/workspace';
import { startOfMonth, addMonths, getMonth } from 'date-fns';
import { YearNavigation } from './yearly-plan/components/YearNavigation';
import { MonthsHeader } from './yearly-plan/components/MonthsHeader';
import { WorkspaceTasksRow } from './yearly-plan/components/WorkspaceTasksRow';
import { StatusLegend } from './yearly-plan/components/StatusLegend';

export const TasksYearlyPlan = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const today = new Date();

  // Get array of months for the year
  const getMonthsOfYear = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(startOfMonth(new Date(year, i, 1)));
    }
    return months;
  };

  // Handle year change
  const handleYearChange = (yearDelta: number) => {
    setYear(prevYear => prevYear + yearDelta);
  };

  // Fetch demo data
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

  const months = getMonthsOfYear();

  return (
    <div className="space-y-6">
      <YearNavigation year={year} onYearChange={handleYearChange} />
      
      <Card className="p-4 overflow-auto">
        <div className="min-w-[1200px]">
          <MonthsHeader months={months} />
          
          <div className="mt-4 space-y-6">
            {workspaces.map((workspace) => (
              <WorkspaceTasksRow
                key={workspace.id}
                workspace={workspace}
                tasks={tasks}
                months={months}
                today={today}
              />
            ))}
          </div>
        </div>
      </Card>

      <StatusLegend />
    </div>
  );
};
