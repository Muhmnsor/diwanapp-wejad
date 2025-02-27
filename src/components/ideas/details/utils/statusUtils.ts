
// دالة للحصول على اسم عرض الحالة بالعربية
export const getStatusDisplay = (status: string): string => {
  // تصحيح القيمة في حالة كانت فارغة أو null أو undefined
  if (!status) {
    console.log("⚠️ getStatusDisplay: القيمة فارغة أو null أو undefined:", status);
    return "قيد المناقشة"; // قيمة افتراضية
  }

  // تعديل الحالة للتأكد من أنها سلسلة
  const normalizedStatus = String(status).trim().toLowerCase();
  console.log(`getStatusDisplay: الحالة بعد التعديل: "${normalizedStatus}"`);

  switch (normalizedStatus) {
    case 'draft':
      return 'قيد المناقشة'; // تحويل مسودة إلى قيد المناقشة
    case 'under_review':
      return 'قيد المناقشة';
    case 'pending_decision':
      return 'بانتظار القرار';
    case 'approved':
      return 'تمت الموافقة';
    case 'rejected':
      return 'مرفوض';
    case 'needs_modification':
      return 'يحتاج تعديل';
    default:
      console.log(`⚠️ getStatusDisplay: حالة غير معروفة: "${normalizedStatus}"`);
      return 'قيد المناقشة'; // استخدام قيمة افتراضية معقولة بدلاً من "غير معروف"
  }
};

// دالة للحصول على اسم الصف CSS للحالة
export const getStatusClass = (status: string): string => {
  // تصحيح القيمة في حالة كانت فارغة أو null أو undefined
  if (!status) {
    console.log("⚠️ getStatusClass: القيمة فارغة أو null أو undefined:", status);
    return 'bg-blue-100 text-blue-800'; // قيمة افتراضية لقيد المناقشة
  }

  // تعديل الحالة للتأكد من أنها سلسلة
  const normalizedStatus = String(status).trim().toLowerCase();

  switch (normalizedStatus) {
    case 'draft':
      return 'bg-blue-100 text-blue-800'; // نفس لون قيد المناقشة
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
      console.log(`⚠️ getStatusClass: حالة غير معروفة: "${normalizedStatus}"`);
      return 'bg-blue-100 text-blue-800'; // استخدام قيمة افتراضية معقولة
  }
};
