
import { Task, Workspace } from "@/types/workspace";
import { eachDayOfInterval, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { getTaskStatusColor, isTaskInDay } from "../utils/dateUtils";

interface WorkspaceTasksRowProps {
  workspace: Workspace;
  tasks: Task[];
  months: Date[];
  today: Date;
}

export const WorkspaceTasksRow = ({ workspace, tasks, months, today }: WorkspaceTasksRowProps) => {
  return (
    <div className="space-y-2">
      <div className="flex">
        <div className="w-48 flex-shrink-0 font-medium">
          {workspace.name}
        </div>
        <div className="flex-1 flex">
          {months.map((month, monthIndex) => {
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
                
                <div className="relative h-8 mt-1">
                  {tasks
                    .filter(task => task.workspace_id === workspace.id)
                    .map(task => {
                      if (!task.start_date || !task.end_date) return null;
                      
                      const startDate = new Date(task.start_date);
                      const endDate = new Date(task.end_date);
                      
                      const left = (startDate.getDate() - 1) / daysInMonth.length * 100;
                      const width = (endDate.getDate() / daysInMonth.length * 100) - left;
                      
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
  );
};
