
import { FC } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

interface IdeaExecutionSectionProps {
  proposedExecutionDate: string;
  duration: string;
}

export const IdeaExecutionSection: FC<IdeaExecutionSectionProps> = ({ 
  proposedExecutionDate, 
  duration 
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return format(date, "d MMMM yyyy", { locale: ar });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">التنفيذ المقترح</h3>
      <div className="flex items-center gap-4">
        <p className="text-gray-700">
          تاريخ التنفيذ: {formatDate(proposedExecutionDate)}
        </p>
        <Separator orientation="vertical" className="h-6" />
        <p className="text-gray-700">
          المدة المتوقعة: {duration}
        </p>
      </div>
    </section>
  );
};
