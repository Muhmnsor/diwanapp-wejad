
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Meeting } from "@/types/meeting";
import { useAuthStore } from "@/store/refactored-auth";

interface AgendaItem {
  content: string;
  order_number: number;
}

interface Objective {
  content: string;
  order_number: number;
}

export interface CreateMeetingData {
  title: string;
  date: string;
  start_time: string;
  duration: number;
  location?: string;
  meeting_link?: string;
  attendance_type: string;
  meeting_status: string;
  folder_id: string;
  agenda_items: AgendaItem[];
  objectives: Objective[];
  created_by?: string;
}

export const useCreateMeeting = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const createMeeting = async (meetingData: Partial<CreateMeetingData> & { folder_id: string; agenda_items: AgendaItem[]; objectives: Objective[] }): Promise<Meeting | null> => {
    setIsLoading(true);
    
    try {
      if (!user?.id) {
        throw new Error('يجب تسجيل الدخول لإنشاء اجتماع');
      }

      // Ensure required fields are provided
      if (!meetingData.title || !meetingData.date || !meetingData.start_time || !meetingData.duration || 
          !meetingData.attendance_type || !meetingData.meeting_status) {
        throw new Error('يرجى استكمال جميع الحقول المطلوبة');
      }
      
      // 1. Insert meeting record with user ID
      const { data: meeting, error } = await supabase
        .from('meetings')
        .insert({
          title: meetingData.title,
          date: meetingData.date,
          start_time: meetingData.start_time,
          duration: meetingData.duration,
          location: meetingData.location,
          meeting_link: meetingData.meeting_link,
          attendance_type: meetingData.attendance_type,
          meeting_status: meetingData.meeting_status,
          folder_id: meetingData.folder_id,
          meeting_type: 'other', // Default value since we're not using this field
          created_by: user.id, // Add the user ID for row-level security
        })
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating meeting:', error);
        throw new Error(`فشل إنشاء الاجتماع: ${error.message || error.details || 'خطأ غير معروف'}`);
      }
      
      if (!meeting) throw new Error('فشل إنشاء الاجتماع');
      
      // 2. Filter out empty agenda items and insert the valid ones
      if (meetingData.agenda_items && meetingData.agenda_items.length > 0) {
        const validAgendaItems = meetingData.agenda_items.filter(item => item.content.trim() !== '');
        
        if (validAgendaItems.length > 0) {
          const agendaItemsToInsert = validAgendaItems.map(item => ({
            meeting_id: meeting.id,
            content: item.content.trim(),
            order_number: item.order_number,
            created_by: user.id
          }));
          
          const { error: agendaError } = await supabase
            .from('meeting_agenda_items')
            .insert(agendaItemsToInsert);
          
          if (agendaError) {
            console.error('Error inserting agenda items:', agendaError);
            throw new Error(`فشل إضافة بنود جدول الأعمال: ${agendaError.message}`);
          }
        }
      }
      
      // 3. Filter out empty objectives and insert the valid ones
      if (meetingData.objectives && meetingData.objectives.length > 0) {
        const validObjectives = meetingData.objectives.filter(objective => objective.content.trim() !== '');
        
        if (validObjectives.length > 0) {
          const objectivesToInsert = validObjectives.map(objective => ({
            meeting_id: meeting.id,
            content: objective.content.trim(),
            order_number: objective.order_number,
            created_by: user.id
          }));
          
          const { error: objectivesError } = await supabase
            .from('meeting_objectives')
            .insert(objectivesToInsert);
          
          if (objectivesError) {
            console.error('Error inserting objectives:', objectivesError);
            throw new Error(`فشل إضافة أهداف الاجتماع: ${objectivesError.message}`);
          }
        }
      }
      
      toast.success('تم إنشاء الاجتماع بنجاح');
      return meeting;
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      toast.error(error.message || 'حدث خطأ أثناء إنشاء الاجتماع');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    createMeeting,
    isLoading
  };
};
