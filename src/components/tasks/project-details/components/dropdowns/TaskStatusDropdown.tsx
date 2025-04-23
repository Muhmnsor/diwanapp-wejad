
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { getStatusText } from "@/components/tasks/utils/taskFormatters";

interface TaskStatusDropdownProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const STATUS_OPTIONS = ["completed", "pending", "delayed", "in_progress"] as const;

export const TaskStatusDropdown = ({
  currentStatus,
  onStatusChange,
}: TaskStatusDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`w-[130px] justify-between ${
            currentStatus === "completed"
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              : currentStatus === "delayed"
              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              : currentStatus === "in_progress"
              ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
          }`}
        >
          {getStatusText(currentStatus)}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[130px]">
        {STATUS_OPTIONS.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => onStatusChange(status)}
            className={`justify-start ${
              status === currentStatus ? "bg-muted" : ""
            }`}
          >
            {getStatusText(status)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
