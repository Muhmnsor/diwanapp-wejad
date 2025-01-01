import { Calendar } from "lucide-react";

interface ProjectDatesProps {
  startDate: string;
  endDate: string;
}

export const ProjectDates = ({ startDate, endDate }: ProjectDatesProps) => {
  return (
    <>
      <div className="flex items-center gap-2 text-gray-600">
        <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <span>تاريخ البداية: {startDate}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <span>تاريخ النهاية: {endDate}</span>
      </div>
    </>
  );
};