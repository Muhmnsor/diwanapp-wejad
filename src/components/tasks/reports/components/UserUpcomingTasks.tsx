
import { AlertCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserUpcomingTasksProps {
  tasks: Array<any>;
}

export const UserUpcomingTasks = ({ tasks }: UserUpcomingTasksProps) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-muted-foreground">لا توجد مهام قادمة</h3>
      </div>
    );
  }
  
  // Helper to get days remaining
  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    
    // clear time part for accurate day calculation
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Helper to get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">عالية</Badge>;
      case 'medium':
        return <Badge variant="default">متوسطة</Badge>;
      case 'low':
        return <Badge variant="secondary">منخفضة</Badge>;
      default:
        return <Badge variant="outline">عادية</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const daysRemaining = task.due_date ? getDaysRemaining(task.due_date) : null;
        const isOverdue = daysRemaining !== null && daysRemaining < 0;
        
        return (
          <div key={task.id} className="border rounded-md p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center ${
                  isOverdue ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {isOverdue ? (
                    <AlertCircle className="h-3 w-3 text-red-600" />
                  ) : (
                    <Calendar className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {task.priority && getPriorityBadge(task.priority)}
                
                {daysRemaining !== null && (
                  <span className={`text-xs ${isOverdue ? 'text-red-500' : 'text-blue-500'}`}>
                    {isOverdue 
                      ? `متأخر بـ ${Math.abs(daysRemaining)} يوم` 
                      : daysRemaining === 0 
                        ? 'اليوم'
                        : `متبقي ${daysRemaining} يوم`}
                  </span>
                )}
              </div>
            </div>
            
            {task.due_date && (
              <div className="flex items-center mt-3 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                تاريخ الاستحقاق: {new Date(task.due_date).toLocaleDateString('ar-SA')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
