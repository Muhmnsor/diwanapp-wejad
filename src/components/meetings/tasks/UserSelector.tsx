
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMeetingTasksContext, MeetingTasksProvider } from "@/contexts/meetings/MeetingTasksContext";

interface UserSelectorProps {
  value: string;
  onChange: (value: string) => void;
  meetingId: string;
  label?: string;
  placeholder?: string;
}

// The wrapper component that ensures context is available
export const UserSelector: React.FC<UserSelectorProps> = (props) => {
  return (
    <MeetingTasksProvider meetingId={props.meetingId}>
      <UserSelectorInner {...props} />
    </MeetingTasksProvider>
  );
};

// The inner component that uses the context
const UserSelectorInner: React.FC<UserSelectorProps> = ({ 
  value, 
  onChange, 
  label = "المسؤول",
  placeholder = "اختر المسؤول" 
}) => {
  const { participants, users, isLoadingParticipants, isLoadingUsers } = useMeetingTasksContext();

  // Combine participants and users, removing duplicates by id
  const allUsers = React.useMemo(() => {
    const participantIds = new Set(participants.map(p => p.user_id));
    const nonParticipantUsers = users.filter(u => !participantIds.has(u.id));
    
    return [
      ...participants.map(p => ({ id: p.user_id, name: p.user?.display_name || p.user?.email || p.user_id })),
      ...nonParticipantUsers.map(u => ({ id: u.id, name: u.display_name || u.email }))
    ];
  }, [participants, users]);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">غير محدد</SelectItem>
          {isLoadingParticipants || isLoadingUsers ? (
            <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
          ) : (
            allUsers.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
