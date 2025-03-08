
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useRecurringTasks } from "./hooks/useRecurringTasks";
import { RecurringTaskCard } from "./components/recurring/RecurringTaskCard";
import { EmptyRecurringTasks } from "./components/recurring/EmptyRecurringTasks";
import { RecurringTasksFilter } from "./components/recurring/RecurringTasksFilter";

export const TasksRecurring = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const {
    recurringTasks,
    isLoading,
    isAdmin,
    isGenerating,
    toggleTaskStatus,
    deleteTask,
    generateTasks
  } = useRecurringTasks();

  const filteredTasks = recurringTasks.filter(task => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return task.is_active;
    if (activeFilter === "paused") return !task.is_active;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <RecurringTasksFilter 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {isAdmin && (
          <Button 
            onClick={generateTasks} 
            disabled={isGenerating}
            variant="outline"
            className="flex gap-2 items-center"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                إنشاء المهام المجدولة
              </>
            )}
          </Button>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyRecurringTasks />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map(task => (
            <RecurringTaskCard 
              key={task.id} 
              task={task} 
              onToggleStatus={toggleTaskStatus}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};
