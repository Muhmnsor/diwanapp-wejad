
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MeetingFormData } from "@/types/meeting";
import { toast } from "sonner";

interface UseSaveMeetingResult {
  saveMeeting: (data: MeetingFormData, folderId?: string) => Promise<string | null>;
  isLoading: boolean;
}

export const useSaveMeeting = (): UseSaveMeetingResult => {
  const [isLoading, setIsLoading] = useState(false);

  const saveMeeting = async (data: MeetingFormData, folderId?: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      // Get current user's ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const userId = userData.user?.id;
      if (!userId) {
        throw new Error("لم يتم العثور على المستخدم الحالي");
      }
      
      // Prepare meeting data
      const meetingData = {
        title: data.title,
        description: data.description || null,
        date: data.date,
        start_time: data.start_time,
        duration: data.duration,
        location: data.location,
        location_url: data.location_url || null,
        meeting_status: data.meeting_status,
        attendance_type: data.attendance_type,
        meeting_type: 'other' as const, // Default type since we're not using it
        creator_id: userId,
        folder_id: folderId || data.folder_id || null,
        objectives: Array.isArray(data.objectives) ? data.objectives : null,
        agenda: Array.isArray(data.agenda) ? data.agenda : null
      };
      
      // Insert meeting
      const { data: insertedData, error: insertError } = await supabase
        .from("meetings")
        .insert(meetingData)
        .select("id")
        .single();
        
      if (insertError) throw insertError;
      
      return insertedData.id;
      
    } catch (error) {
      console.error("Error saving meeting:", error);
      toast.error("حدث خطأ أثناء حفظ الاجتماع");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { saveMeeting, isLoading };
};
