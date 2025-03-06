
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Task } from "../types/task";

interface TaskHeaderProps {
  task: Task;
  status: string;
}

export const TaskHeader = ({ task, status }: TaskHeaderProps) => {
  // Function to determine badge styling based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            مكتملة
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            قيد التنفيذ
          </Badge>
        );
      case "delayed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            متأخرة
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            قيد الانتظار
          </Badge>
        );
    }
  };

  return (
    <div className="flex justify-between items-start">
      <h3 className="text-lg font-semibold">{task.title}</h3>
      <div className="flex space-x-2 rtl:space-x-reverse">
        {getStatusBadge(status)}
      </div>
    </div>
  );
};
