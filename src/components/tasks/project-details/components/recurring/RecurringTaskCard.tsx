
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Edit, Trash, Play } from "lucide-react";
import { formatDate } from "../../utils/taskFormatters";
import { RecurringTask } from "../../types/recurringTask";

interface RecurringTaskCardProps {
  task: RecurringTask;
  onEdit: (task: RecurringTask) => void;
  onDelete: (taskId: string) => void;
  onCreateInstance: (taskId: string) => Promise<void>;
}

export const RecurringTaskCard = ({ 
  task, 
  onEdit, 
  onDelete,
  onCreateInstance 
}: RecurringTaskCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const getFrequencyText = (frequency: string, interval: number) => {
    switch (frequency) {
      case 'daily':
        return interval === 1 ? 'يومي' : `كل ${interval} أيام`;
      case 'weekly':
        return interval === 1 ? 'أسبوعي' : `كل ${interval} أسابيع`;
      case 'monthly':
        return interval === 1 ? 'شهري' : `كل ${interval} أشهر`;
      default:
        return 'غير محدد';
    }
  };
  
  const handleCreateInstance = async () => {
    setIsLoading(true);
    try {
      await onCreateInstance(task.id);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg line-clamp-1">{task.title}</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            {getFrequencyText(task.frequency, task.interval)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-2">
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{task.description}</p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          {task.next_occurrence && (
            <span>الإستحقاق القادم: {formatDate(task.next_occurrence)}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-2 bg-muted/20 flex justify-end gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={() => onEdit(task)}
        >
          <Edit className="h-4 w-4 mr-1" />
          تعديل
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-destructive hover:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash className="h-4 w-4 mr-1" />
          حذف
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="h-8 px-2"
          onClick={handleCreateInstance}
          disabled={isLoading}
        >
          <Play className="h-4 w-4 mr-1" />
          إنشاء مهمة
        </Button>
      </CardFooter>
    </Card>
  );
};
