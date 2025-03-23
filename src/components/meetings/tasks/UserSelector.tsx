
import React from "react";
import { useMeetingParticipants } from "@/hooks/meetings/useMeetingParticipants";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserSelectorProps {
  value: string;
  onChange: (value: string) => void;
  meetingId?: string;
  label?: string;
  placeholder?: string;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  value,
  onChange,
  meetingId,
  label = "المسؤول عن التنفيذ",
  placeholder = "اختر المسؤول عن التنفيذ"
}) => {
  // Fetch meeting participants to use as potential assignees
  const { data: participants, isLoading: isLoadingParticipants } = useMeetingParticipants(meetingId || '');

  // Fetch all active users from profiles
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, display_name")
        .eq("is_active", true)
        .order("display_name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
  
  const isLoading = isLoadingParticipants || isLoadingUsers;

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-right">{label}</label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              جاري التحميل...
            </SelectItem>
          ) : (
            <>
              <SelectItem value="unassigned">-- اختر المسؤول --</SelectItem>
              
              {participants && participants.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-sm font-semibold">المشاركون في الاجتماع</div>
                  {participants.map((participant) => (
                    <SelectItem key={participant.user_id} value={participant.user_id}>
                      {participant.user_display_name || participant.user_email}
                    </SelectItem>
                  ))}
                </>
              )}
              
              {users && users.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-sm font-semibold">جميع المستخدمين</div>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.display_name || user.email}
                    </SelectItem>
                  ))}
                </>
              )}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
