
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Task, Workspace } from '@/types/workspace';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const TasksYearlyPlan = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);

  // تاريخ اليوم للعلامة الحالية
  const today = new Date();

  // توليد تواريخ تحتوي على مهام كمثال (سيتم استبدالها بالبيانات الفعلية)
  const getTaskDates = () => {
    const dates: Date[] = [];
    // كمثال: إنشاء بعض التواريخ العشوائية كأيام تحتوي على مهام
    const currentMonth = new Date().getMonth();
    
    // إضافة 5 أيام عشوائية من الشهر الحالي
    for (let i = 0; i < 5; i++) {
      const day = Math.floor(Math.random() * 28) + 1;
      dates.push(new Date(year, currentMonth, day));
    }
    
    return dates;
  };

  const tasksExistOnDate = (date: Date) => {
    // تعديل لتحقق ما إذا كان هناك مهام في هذا التاريخ
    // سيتم استبداله بالتحقق الفعلي من البيانات
    const taskDates = getTaskDates();
    return taskDates.some(taskDate => 
      taskDate.getDate() === date.getDate() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getFullYear() === date.getFullYear()
    );
  };

  // ستخدم هذه الدالة لاحقًا لجلب المهام بناءً على التاريخ المحدد
  const fetchTasksForDate = (date: Date) => {
    // هذا مجرد مثال، سيتم استبداله بجلب البيانات الفعلية من قاعدة البيانات
    console.log(`Fetching tasks for date: ${format(date, 'yyyy-MM-dd')}`);
    
    // بيانات المهام الافتراضية للعرض فقط
    const demoTasks: Task[] = [
      {
        id: '1',
        title: 'اجتماع فريق العمل',
        description: 'مناقشة المشروع الجديد',
        status: 'pending',
        priority: 'high',
        due_date: format(date, 'yyyy-MM-dd'),
        created_at: new Date().toISOString(),
        workspace_id: 'workspace1',
        workspace_name: 'مساحة العمل الرئيسية'
      },
      {
        id: '2',
        title: 'تحضير العرض التقديمي',
        description: 'إعداد عرض للمشروع',
        status: 'in_progress',
        priority: 'medium',
        due_date: format(date, 'yyyy-MM-dd'),
        created_at: new Date().toISOString(),
        workspace_id: 'workspace1',
        workspace_name: 'مساحة العمل الرئيسية'
      }
    ];
    
    setTasks(demoTasks);
  };

  // تعامل مع تغيير التاريخ المحدد
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      fetchTasksForDate(date);
    }
  };

  // تعامل مع تغيير السنة
  const handleYearChange = (yearDelta: number) => {
    setYear(prevYear => prevYear + yearDelta);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الخطة السنوية {year}</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => handleYearChange(-1)}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            السنة السابقة
          </button>
          <button 
            onClick={() => handleYearChange(1)}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            السنة التالية
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="p-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">تقويم المهام والمشاريع</h3>
            </div>
            <Calendar
              mode="multiple"
              locale={ar}
              selected={[selectedDate as Date]}
              onSelect={(date) => handleDateSelect(date?.[0])}
              className="rounded-md border w-full"
              year={year}
              modifiers={{
                hasTasks: (date) => tasksExistOnDate(date)
              }}
              modifiersClassNames={{
                hasTasks: "bg-blue-100 text-blue-600 font-medium",
                today: "bg-yellow-100 text-yellow-600 font-medium",
                selected: "bg-primary text-primary-foreground"
              }}
            />
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="p-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">
                المهام ليوم {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ar }) : ''}
              </h3>
            </div>
            
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{task.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority === 'high' ? 'مرتفعة' : 
                         task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                      <span>{task.workspace_name}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'completed' ? 'مكتملة' : 
                         task.status === 'in_progress' ? 'قيد التنفيذ' : 'قيد الانتظار'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>لا توجد مهام لهذا اليوم</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
