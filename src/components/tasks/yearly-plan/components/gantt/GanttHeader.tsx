
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface GanttHeaderProps {
  months: Date[];
  groupByLabel: string;
}

export const GanttHeader = ({ months, groupByLabel }: GanttHeaderProps) => {
  return (
    <div className="flex">
      <div className="w-48 flex-shrink-0 py-2 px-3 font-medium border-b">
        {groupByLabel}
      </div>
      <div className="flex-1 flex">
        {months.map((month, index) => (
          <div key={index} className="flex-1 text-center py-2 font-medium border-b border-r">
            {format(month, 'MMMM', { locale: ar })}
          </div>
        ))}
      </div>
    </div>
  );
};
