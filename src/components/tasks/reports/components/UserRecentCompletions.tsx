
import { Check, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserRecentCompletionsProps {
  tasks: Array<any>;
}

export const UserRecentCompletions = ({ tasks }: UserRecentCompletionsProps) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-muted-foreground">لا توجد مهام مكتملة حديثاً</h3>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="border rounded-md p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-green-600" />
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
            <Badge variant="outline" className="ml-2">
              {task.type === 'task' ? 'مهمة' : 
               task.type === 'portfolio' ? 'مهمة محفظة' : 
               task.type === 'project' ? 'مشروع' : 'مهمة فرعية'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              تم الإكمال: {new Date(task.updated_at).toLocaleDateString('ar-SA')}
            </div>
            
            {task.due_date && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                تاريخ الاستحقاق: {new Date(task.due_date).toLocaleDateString('ar-SA')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
