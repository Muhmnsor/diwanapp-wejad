
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Meeting } from "@/types/meeting";

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
}

export const useCreateMeeting = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createMeeting = async (data: CreateMeetingData): Promise<Meeting | null> => {
    setIsLoading(true);
    
    try {
      // 1. Insert meeting record
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
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (!meeting) throw new Error('Failed to create meeting');
      
      // 2. Insert agenda items
      if (data.agenda_items.length > 0) {
        const agendaItemsToInsert = data.agenda_items.map(item => ({
          meeting_id: meeting.id,
          content: item.content,
          order_number: item.order_number
        }));
        
        const { error: agendaError } = await supabase
          .from('meeting_agenda_items')
          .insert(agendaItemsToInsert);
        
        if (agendaError) throw agendaError;
      }
      
      // 3. Insert objectives
      if (data.objectives.length > 0) {
        const objectivesToInsert = data.objectives.map(objective => ({
          meeting_id: meeting.id,
          content: objective.content,
          order_number: objective.order_number
        }));
        
        const { error: objectivesError } = await supabase
          .from('meeting_objectives')
          .insert(objectivesToInsert);
        
        if (objectivesError) throw objectivesError;
      }
      
      toast.success('تم إنشاء الاجتماع بنجاح');
      return meeting;
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      toast.error('حدث خطأ أثناء إنشاء الاجتماع: ' + (error.message || error));
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
