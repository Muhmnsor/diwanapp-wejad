
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PendingTasksList } from "@/components/tasks/PendingTasksList";

export const TasksSection = () => {
  return (
    <Card className="p-6">
      <div className="flex flex-row-reverse items-center mb-4">
        <Clock className="w-6 h-6 text-primary mr-2" />
        <h2 className="text-xl font-semibold">المهام المطلوبة</h2>
      </div>
      <PendingTasksList />
    </Card>
  );
};
