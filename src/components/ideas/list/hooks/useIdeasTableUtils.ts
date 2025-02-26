
export const useIdeasTableUtils = () => {
  const getStatusDisplay = (status: string) => {
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

  const getStatusClass = (status: string) => {
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

  const calculateRemainingTime = (discussionPeriod: string | null) => {
    if (!discussionPeriod) return "لم يتم تحديد مدة";
    
    try {
      const days = parseInt(discussionPeriod.split(' ')[0]);
      if (isNaN(days)) return "تنسيق غير صحيح";

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      
      if (diffTime <= 0) {
        return "انتهت المناقشة";
      }

      const remainingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const remainingHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (remainingDays > 0) {
        return `${remainingDays} يوم و ${remainingHours} ساعة`;
      } else if (remainingHours > 0) {
        return `${remainingHours} ساعة`;
      } else {
        return "أقل من ساعة";
      }
    } catch (error) {
      console.error('Error calculating remaining time:', error);
      return "خطأ في الحساب";
    }
  };

  return {
    getStatusDisplay,
    getStatusClass,
    calculateRemainingTime
  };
};
