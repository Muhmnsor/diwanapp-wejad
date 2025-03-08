
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarRepeat, Clock, User, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface RecurringTask {
  id: string;
  title: string;
  description?: string;
  frequency: string;
  interval: number;
  next_occurrence: string;
  assigned_to?: string | null;
  assigned_user_name?: string;
  status: string;
  end_date?: string | null;
  end_after?: number | null;
  days_of_week?: string[] | null;
  day_of_month?: number | null;
  created_at: string;
}

interface RecurringTaskCardProps {
  task: RecurringTask;
  onDelete: (taskId: string) => void;
}

export const RecurringTaskCard = ({ task, onDelete }: RecurringTaskCardProps) => {
  const getFrequencyText = () => {
    const intervalText = task.interval > 1 ? `كل ${task.interval} ` : 'كل ';
    
    switch (task.frequency) {
      case 'daily':
        return `${intervalText} يوم`;
      case 'weekly':
        return `${intervalText} أسبوع`;
      case 'monthly':
        return `${intervalText} شهر`;
      default:
        return 'غير محدد';
    }
  };
  
  const getDaysOfWeekText = () => {
    if (!task.days_of_week || task.days_of_week.length === 0) return null;
    
    const dayNames: Record<string, string> = {
      'sun': 'الأحد',
      'mon': 'الإثنين',
      'tue': 'الثلاثاء',
      'wed': 'الأربعاء',
      'thu': 'الخميس',
      'fri': 'الجمعة',
      'sat': 'السبت'
    };
    
    const days = task.days_of_week.map(day => dayNames[day] || day).join('، ');
    return `أيام ${days}`;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <Badge variant="outline">{getFrequencyText()}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 space-y-2">
        {task.description && (
          <p className="text-sm text-gray-600">{task.description}</p>
        )}
        
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 ml-1.5" />
            <span>المرة القادمة: {formatDate(task.next_occurrence)}</span>
          </div>
          
          {task.assigned_user_name && (
            <div className="flex items-center text-sm text-gray-500">
              <User className="h-4 w-4 ml-1.5" />
              <span>{task.assigned_user_name}</span>
            </div>
          )}
          
          {task.frequency === 'weekly' && getDaysOfWeekText() && (
            <div className="flex items-center text-sm text-gray-500">
              <CalendarRepeat className="h-4 w-4 ml-1.5" />
              <span>{getDaysOfWeekText()}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="destructive" 
          size="sm" 
          className="ml-auto"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="h-4 w-4 ml-1.5" />
          حذف
        </Button>
      </CardFooter>
    </Card>
  );
};
