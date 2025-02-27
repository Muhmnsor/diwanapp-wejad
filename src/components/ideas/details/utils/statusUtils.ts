
export const getStatusClass = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'under_review':
      return 'bg-blue-100 text-blue-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusDisplay = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'مسودة';
    case 'under_review':
      return 'قيد المراجعة';
    case 'approved':
      return 'تمت الموافقة';
    case 'rejected':
      return 'مرفوضة';
    default:
      return 'مؤرشفة';
  }
};
