
import { useState } from "react";
import { MeetingParticipant } from "@/types/meeting";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface User {
  id: string;
  display_name: string;
  email: string;
}

interface UseAddMeetingParticipantResult {
  participants: Array<Partial<MeetingParticipant> & { temp_id?: string }>;
  addParticipant: (user: User, role?: string) => void;
  removeParticipant: (index: number) => void;
  updateParticipantRole: (index: number, role: string) => void;
  addExternalParticipant: (name: string, email?: string, role?: string) => void;
  saveParticipants: (meetingId: string) => Promise<boolean>;
  isLoading: boolean;
}

export const useAddMeetingParticipant = (): UseAddMeetingParticipantResult => {
  const [participants, setParticipants] = useState<Array<Partial<MeetingParticipant> & { temp_id?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addParticipant = (user: User, role: string = "member") => {
    // Check if participant already exists
    const exists = participants.some(
      p => (p.user_id && p.user_id === user.id) || (p.user_email && p.user_email === user.email)
    );

    if (exists) {
      toast.error("هذا المستخدم موجود بالفعل في قائمة المشاركين");
      return;
    }

    setParticipants(prev => [
      ...prev,
      {
        temp_id: uuidv4(),
        user_id: user.id,
        user_display_name: user.display_name,
        user_email: user.email,
        role,
        is_external: false,
        attendance_status: "pending",
        notification_sent: false
      }
    ]);
  };

  const addExternalParticipant = (name: string, email?: string, role: string = "member") => {
    if (!name.trim()) return;

    // Check if participant already exists with the same email
    if (email && participants.some(p => p.user_email === email)) {
      toast.error("هذا البريد الإلكتروني موجود بالفعل في قائمة المشاركين");
      return;
    }

    setParticipants(prev => [
      ...prev,
      {
        temp_id: uuidv4(),
        user_display_name: name,
        user_email: email,
        role,
        is_external: true,
        attendance_status: "pending",
        notification_sent: false
      }
    ]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(prev => prev.filter((_, i) => i !== index));
  };

  const updateParticipantRole = (index: number, role: string) => {
    setParticipants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], role };
      return updated;
    });
  };

  const saveParticipants = async (meetingId: string): Promise<boolean> => {
    if (!meetingId) return false;
    
    setIsLoading(true);
    try {
      // Format participants for database
      const participantsToSave = participants.map(p => ({
        meeting_id: meetingId,
        user_id: p.user_id || null,
        user_email: p.user_email || null,
        user_display_name: p.user_display_name,
        role: p.role,
        is_external: p.is_external,
        attendance_status: "pending",
        notification_sent: false
      }));

      const { error } = await supabase
        .from("meeting_participants")
        .insert(participantsToSave);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error saving participants:", error);
      toast.error("حدث خطأ أثناء حفظ المشاركين");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    participants, 
    addParticipant, 
    removeParticipant, 
    updateParticipantRole,
    addExternalParticipant,
    saveParticipants,
    isLoading
  };
};
