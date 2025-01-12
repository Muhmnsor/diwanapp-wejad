import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { CardContent } from "@/components/ui/card";

interface TaskCardContentProps {
  description: string | null;
  dueDate: string | null;
}

export const TaskCardContent = ({ description, dueDate }: TaskCardContentProps) => {
  if (!description && !dueDate) return null;

  return (
    <CardContent>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      {dueDate && (
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(dueDate), "dd/MM/yyyy")}</span>
        </div>
      )}
    </CardContent>
  );
};