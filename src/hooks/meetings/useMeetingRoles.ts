
import { ParticipantRole } from '@/types/meeting';

export const useMeetingRoles = () => {
  // Translates role values to Arabic display text
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

  // Gets the available roles for dropdown selection
  const getAllRoles = (): ParticipantRole[] => {
    return ['chairman', 'secretary', 'member', 'observer'];
  };

  // Provides object mapping of roles for use in components
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
