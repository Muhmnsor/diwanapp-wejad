
export const getStepTypeLabel = (stepType: string): string => {
  switch (stepType) {
    case 'decision':
      return 'قرار';
    case 'opinion':
      return 'رأي';
    case 'review':
      return 'مراجعة';
    case 'approval':
      return 'موافقة';
    case 'notification':
      return 'إشعار';
    default:
      return stepType;
  }
};

export const getStepTypeBadgeClass = (stepType: string): string => {
  switch (stepType) {
    case 'decision':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'opinion':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'review':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'approval':
      return 'bg-green-50 text-green-600 border-green-200';
    case 'notification':
      return 'bg-gray-50 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-800 border-gray-200';
  }
};
