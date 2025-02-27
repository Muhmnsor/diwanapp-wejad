
// دالة للحصول على اسم عرض الحالة بالعربية
export const getStatusDisplay = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'مسودة';
    case 'under_review':
      return 'قيد المراجعة';
    case 'pending_decision':
      return 'بانتظار القرار';
    case 'approved':
      return 'تمت الموافقة';
    case 'rejected':
      return 'مرفوض';
    case 'needs_modification':
      return 'يحتاج تعديل';
    default:
      return 'غير معروف';
  }
};

// دالة للحصول على اسم الصف CSS للحالة
export const getStatusClass = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'under_review':
      return 'bg-blue-100 text-blue-800';
    case 'pending_decision':
      return 'bg-amber-100 text-amber-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'needs_modification':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
