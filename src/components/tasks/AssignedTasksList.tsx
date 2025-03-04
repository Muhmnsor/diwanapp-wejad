
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssignedTasks } from "./hooks/useAssignedTasks";
import { TasksLoadingState } from "./components/TasksLoadingState";
import { TasksEmptyState } from "./components/TasksEmptyState";
import { TaskTableRow } from "./components/TaskTableRow";

export const AssignedTasksList = () => {
  const { data: tasks, isLoading } = useAssignedTasks();

  if (isLoading) {
    return <TasksLoadingState />;
  }

  if (!tasks || tasks.length === 0) {
    return <TasksEmptyState />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">عنوان المهمة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الأولوية</TableHead>
            <TableHead>تاريخ الاستحقاق</TableHead>
            <TableHead>المشروع</TableHead>
            <TableHead>المساحة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskTableRow key={task.id} task={task} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
