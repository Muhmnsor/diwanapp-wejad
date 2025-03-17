
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Meeting } from "@/types/meeting";
import { toast } from "sonner";

export interface CreateMeetingData {
  title: string;
  meeting_type: string;
  date: string;
  start_time: string;
  duration: number;
  location?: string;
  meeting_link?: string;
  objectives?: string;
  attendance_type: string;
}

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (meetingData: CreateMeetingData) => {
      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("يجب تسجيل الدخول لإنشاء اجتماع");
      }
      
      const { data, error } = await supabase
        .from('meetings')
        .insert([{
          ...meetingData,
          created_by: user.id,
          meeting_status: 'scheduled',
          status: 'upcoming'
        }])
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating meeting:', error);
        throw error;
      }
      
      return data as Meeting;
    },
    onSuccess: () => {
      toast.success('تم إنشاء الاجتماع بنجاح');
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: (error) => {
      console.error('Error in meeting creation:', error);
      toast.error('حدث خطأ أثناء إنشاء الاجتماع');
    }
  });
};
