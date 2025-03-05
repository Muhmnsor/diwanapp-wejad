
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useIdeaNotifications } from '@/hooks/useIdeaNotifications';

export const useComments = (ideaId: string) => {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { sendIdeaCommentNotification } = useIdeaNotifications();

  useEffect(() => {
    fetchComments();

    // Set up realtime subscription
    const channel = supabase
      .channel('idea-comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'idea_comments',
          filter: `idea_id=eq.${ideaId}`
        },
        (payload) => {
          console.log('New comment added:', payload);
          // Add the new comment to the list
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ideaId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('idea_comments')
        .select(`*, profiles(*)`)
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('حدث خطأ أثناء استرجاع التعليقات');
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (comment: string, file?: File) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول لإضافة تعليق');
      return;
    }

    setIsSubmitting(true);
    let fileUrl = null;
    let fileName = null;

    try {
      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `idea-comments/${ideaId}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);
          
        fileUrl = urlData.publicUrl;
        fileName = file.name;
      }

      // Add comment to database
      const { data: commentData, error: commentError } = await supabase
        .from('idea_comments')
        .insert({
          idea_id: ideaId,
          user_id: user.id,
          comment,
          file_url: fileUrl,
          file_name: fileName
        })
        .select()
        .single();

      if (commentError) throw commentError;
      
      // Get idea details
      const { data: ideaData, error: ideaError } = await supabase
        .from('ideas')
        .select('title, created_by')
        .eq('id', ideaId)
        .single();
        
      if (ideaError) throw ideaError;
      
      // Send notification to idea creator
      if (ideaData.created_by && ideaData.created_by !== user.id) {
        const userData = await supabase.auth.getUser(user.id);
        const userName = userData.data?.user?.email || 'مستخدم';
        
        await sendIdeaCommentNotification({
          ideaId,
          ideaTitle: ideaData.title,
          userId: ideaData.created_by,
          updatedByUserId: user.id,
          updatedByUserName: userName
        });
      }

      toast.success('تم إضافة التعليق بنجاح');
      
      // Clear form (handled by parent component)
      return commentData;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error(error.message || 'حدث خطأ أثناء إضافة التعليق');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { comments, isLoading, isSubmitting, addComment };
};
