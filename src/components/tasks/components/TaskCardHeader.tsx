import { CheckCircle2, Circle, Clock } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface TaskCardHeaderProps {
  title: string;
  status: string;
}

export const TaskCardHeader = ({ title, status }: TaskCardHeaderProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div className="flex items-center gap-4">
        {getStatusIcon()}
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
    </CardHeader>
  );
};