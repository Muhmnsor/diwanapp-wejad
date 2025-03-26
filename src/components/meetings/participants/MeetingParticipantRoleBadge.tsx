
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ParticipantRole } from '@/types/meeting';
import { useMeetingRoles } from '@/hooks/meetings/useMeetingRoles';

interface MeetingParticipantRoleBadgeProps {
  role: ParticipantRole;
}

export const MeetingParticipantRoleBadge: React.FC<MeetingParticipantRoleBadgeProps> = ({ role }) => {
  const { getRoleLabel } = useMeetingRoles();
  const roleLabel = getRoleLabel(role);
  
  switch (role) {
    case 'chairman':
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
          {roleLabel}
        </Badge>
      );
    case 'secretary':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          {roleLabel}
        </Badge>
      );
    case 'member':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          {roleLabel}
        </Badge>
      );
    case 'observer':
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          {roleLabel}
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          {roleLabel || String(role)}
        </Badge>
      );
  }
};
