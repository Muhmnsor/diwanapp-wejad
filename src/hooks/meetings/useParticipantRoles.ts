
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ParticipantRole } from "@/types/meeting";
import { useMeetingRoles } from "./useMeetingRoles";

export const useParticipantRoles = (meetingId: string) => {
  const [availableRoles, setAvailableRoles] = useState<ParticipantRole[]>([]);
  const { getAllRoles } = useMeetingRoles();
  
  useEffect(() => {
    const fetchRoles = async () => {
      if (!meetingId) return;
      
      try {
        // Get all assigned roles for this meeting
        const { data: participants, error } = await supabase
          .from('meeting_participants')
          .select('role')
          .eq('meeting_id', meetingId);
          
        if (error) throw error;
        
        // Get the complete list of possible roles
        const allRoles = getAllRoles();
        
        // Check which roles are already assigned (we only allow one chairman and one secretary)
        const assignedRoles = participants?.map(p => p.role) || [];
        const hasChairman = assignedRoles.includes('chairman');
        const hasSecretary = assignedRoles.includes('secretary');
        
        // Filter available roles based on what's already assigned
        const filtered = allRoles.filter(role => {
          if (role === 'chairman' && hasChairman) return false;
          if (role === 'secretary' && hasSecretary) return false;
          return true;
        });
        
        setAvailableRoles(filtered);
      } catch (error) {
        console.error('Error fetching available roles:', error);
        // Fallback to all roles if there's an error
        setAvailableRoles(getAllRoles());
      }
    };
    
    fetchRoles();
  }, [meetingId, getAllRoles]);
  
  return {
    availableRoles
  };
};
