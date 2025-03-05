
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface GanttHeaderProps {
  months: Date[];
  groupByLabel: string;
}

export const GanttHeader = ({ months, groupByLabel }: GanttHeaderProps) => {
  return (
    <div className="flex border-b pb-2">
      <div className="w-48 flex-shrink-0 font-bold">
        {groupByLabel}
      </div>
      <div className="flex-1 flex">
        {months.map((month, index) => (
          <div 
            key={index} 
            className="flex-1 text-center font-medium text-sm"
          >
            {format(month, 'MMMM', { locale: ar })}
          </div>
        ))}
      </div>
    </div>
  );
};
