
export const getTaskStatusColor = (status: string) => {
  switch(status) {
    case 'completed':
      return '#22c55e'; // green-500
    case 'in_progress':
      return '#3b82f6'; // blue-500
    case 'pending':
      return '#f59e0b'; // amber-500
    default:
      return '#94a3b8'; // gray-400
  }
};

export const getProjectStatusColor = (status: string) => {
  switch(status) {
    case 'completed':
      return '#22c55e'; // green-500
    case 'in_progress':
      return '#3b82f6'; // blue-500
    case 'pending':
      return '#f59e0b'; // amber-500
    case 'delayed':
      return '#ef4444'; // red-500
    case 'stopped':
      return '#6b7280'; // gray-500
    default:
      return '#94a3b8'; // gray-400
  }
};
