
import { ParticipantRole } from '@/types/meeting';

export const useMeetingRoles = () => {
  // ترجمة قيم الأدوار إلى النص العربي المعروض
  const getRoleLabel = (role: ParticipantRole): string => {
    switch (role) {
      case 'chairman':
        return 'رئيس الاجتماع';
      case 'secretary':
        return 'مقرر';
      case 'member':
        return 'عضو';
      case 'observer':
        return 'مراقب';
      default:
        return String(role);
    }
  };

  // الحصول على جميع الأدوار المتاحة لقائمة الاختيار
  const getAllRoles = (): ParticipantRole[] => {
    return ['chairman', 'secretary', 'member', 'observer'];
  };

  // توفير تخطيط كائن للأدوار للاستخدام في المكونات
  const getRoleOptions = () => {
    return getAllRoles().map(role => ({
      value: role,
      label: getRoleLabel(role)
    }));
  };

  return {
    getRoleLabel,
    getAllRoles,
    getRoleOptions
  };
};
