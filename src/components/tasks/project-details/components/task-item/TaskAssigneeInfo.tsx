
import { Users } from "lucide-react";

interface TaskAssigneeInfoProps {
  assignedUserName: string | null | undefined;
}

export const TaskAssigneeInfo = ({ assignedUserName }: TaskAssigneeInfoProps) => {
  if (!assignedUserName) {
    return <span className="text-gray-400">غير محدد</span>;
  }
  
  return (
    <div className="flex items-center">
      <Users className="h-3.5 w-3.5 ml-1.5 text-gray-500" />
      {assignedUserName}
    </div>
  );
};
