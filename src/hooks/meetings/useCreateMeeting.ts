
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

interface CreateMeetingData {
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

  const createMeeting = async (data: CreateMeetingData): Promise<Meeting | null> => {
    setIsLoading(true);
    
    try {
      if (!user?.id) {
        throw new Error('يجب تسجيل الدخول لإنشاء اجتماع');
      }

      // Ensure required fields are provided
      if (!data.title || !data.date || !data.start_time || !data.duration || 
          !data.attendance_type || !data.meeting_status || !data.folder_id) {
        throw new Error('يرجى استكمال جميع الحقول المطلوبة');
      }
      
      // 1. Insert meeting record with user ID
      const { data: meeting, error } = await supabase
        .from('meetings')
        .insert({
          title: data.title,
          date: data.date,
          start_time: data.start_time,
          duration: data.duration,
          location: data.location,
          meeting_link: data.meeting_link,
          attendance_type: data.attendance_type,
          meeting_status: data.meeting_status,
          folder_id: data.folder_id,
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
      
      // 2. Insert agenda items
      if (data.agenda_items.length > 0) {
        const agendaItemsToInsert = data.agenda_items.map(item => ({
          meeting_id: meeting.id,
          content: item.content,
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
      
      // 3. Insert objectives
      if (data.objectives.length > 0) {
        const objectivesToInsert = data.objectives.map(objective => ({
          meeting_id: meeting.id,
          content: objective.content,
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
