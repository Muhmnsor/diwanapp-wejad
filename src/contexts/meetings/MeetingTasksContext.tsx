
import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';

interface MeetingTasksContextProps {
  meetingId: string;
  participants: any[];
  users: any[];
  isLoadingParticipants: boolean;
  isLoadingUsers: boolean;
}

const MeetingTasksContext = createContext<MeetingTasksContextProps | undefined>(undefined);

export const MeetingTasksProvider: React.FC<{
  children: ReactNode;
  meetingId: string;
}> = ({ children, meetingId }) => {
  // Fetch meeting participants
  const { data: participants, isLoading: isLoadingParticipants } = useMeetingParticipants(meetingId);

  // Fetch all active users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .eq('is_active', true)
        .order('display_name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <MeetingTasksContext.Provider
      value={{
        meetingId,
        participants: participants || [],
        users: users || [],
        isLoadingParticipants,
        isLoadingUsers,
      }}
    >
      {children}
    </MeetingTasksContext.Provider>
  );
};

export const useMeetingTasksContext = () => {
  const context = useContext(MeetingTasksContext);
  if (context === undefined) {
    throw new Error('useMeetingTasksContext must be used within a MeetingTasksProvider');
  }
  return context;
};
