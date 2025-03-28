
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
        // الحصول على جميع الأدوار المعينة لهذا الاجتماع
        const { data: participants, error } = await supabase
          .from('meeting_participants')
          .select('role')
          .eq('meeting_id', meetingId);
          
        if (error) throw error;
        
        // الحصول على القائمة الكاملة للأدوار الممكنة
        const allRoles = getAllRoles();
        
        // التحقق من الأدوار التي تم تعيينها بالفعل (نسمح فقط برئيس اجتماع واحد ومقرر واحد)
        const assignedRoles = participants?.map(p => p.role) || [];
        const hasChairman = assignedRoles.includes('chairman');
        const hasSecretary = assignedRoles.includes('secretary');
        
        // تصفية الأدوار المتاحة بناءً على ما تم تعيينه بالفعل
        const filtered = allRoles.filter(role => {
          if (role === 'chairman' && hasChairman) return false;
          if (role === 'secretary' && hasSecretary) return false;
          return true;
        });
        
        setAvailableRoles(filtered);
      } catch (error) {
        console.error('Error fetching available roles:', error);
        // الرجوع إلى جميع الأدوار في حالة وجود خطأ
        setAvailableRoles(getAllRoles());
      }
    };
    
    fetchRoles();
  }, [meetingId, getAllRoles]);
  
  return {
    availableRoles
  };
};
