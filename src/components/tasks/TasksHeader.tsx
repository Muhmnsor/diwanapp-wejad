
import React from "react";
import { useNavigate } from "react-router-dom";

interface TasksHeaderProps {
  showCacheMonitor?: boolean;
}

export const TasksHeader: React.FC<TasksHeaderProps> = ({ showCacheMonitor = false }) => {
  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-3xl font-bold">المهام</h1>
    </div>
  );
};
