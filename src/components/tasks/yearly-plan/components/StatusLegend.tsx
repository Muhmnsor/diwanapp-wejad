
import { getTaskStatusColor } from '../utils/dateUtils';

export const StatusLegend = () => {
  const statuses = [
    { status: 'completed', label: 'مكتمل' },
    { status: 'in_progress', label: 'قيد التنفيذ' },
    { status: 'pending', label: 'معلق' },
    { status: 'delayed', label: 'متأخر' },
  ];

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {statuses.map((item) => (
        <div key={item.status} className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full ${getTaskStatusColor(item.status)}`}
          ></div>
          <span className="text-sm">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
