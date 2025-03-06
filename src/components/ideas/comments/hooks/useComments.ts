
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Comment } from '../types';
import { toast } from 'sonner';
import { useIdeaNotifications } from '@/hooks/useIdeaNotifications';

export const useComments = (ideaId: string, creatorId?: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { sendIdeaCommentNotification } = useIdeaNotifications();

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      
      if (!ideaId) {
        return;
      }
      
      // Fetch comments for the idea
      const { data, error } = await supabase
        .from('idea_comments')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }
      
      // Transform the comments to match our Comment type
      const transformedComments: Comment[] = data.map((comment) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        parent_id: comment.parent_id,
        idea_id: ideaId,
        user_name: comment.user_name,
        user_email: comment.user_email,
        attachment_url: comment.attachment_url,
        attachment_type: comment.attachment_type,
        attachment_name: comment.attachment_name
      }));
      
      setComments(transformedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('فشل في جلب التعليقات');
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (content: string, parentId: string | null = null, file?: File) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول لإضافة تعليق');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      let attachment_url = null;
      let attachment_name = null;
      let attachment_type = null;
      
      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(fileName, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(fileName);
          
        attachment_url = urlData.publicUrl;
        attachment_name = file.name;
        attachment_type = file.type;
      }
      
      // Insert comment
      const { data, error } = await supabase
        .from('idea_comments')
        .insert({
          content,
          user_id: user.id,
          idea_id: ideaId,
          parent_id: parentId,
          attachment_url,
          attachment_name,
          attachment_type
        })
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      // Send notification to idea creator if this is not their own comment
      if (creatorId && creatorId !== user.id) {
        await sendIdeaCommentNotification({
          ideaId,
          ideaTitle: 'الفكرة', // You might want to pass the actual idea title
          userId: creatorId,
          createdByUserName: user.email,
          actionType: 'comment'
        });
      }
      
      // Add the new comment to the state
      const newComment: Comment = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        user_id: data.user_id,
        parent_id: data.parent_id,
        idea_id: ideaId,
        user_name: data.user_name,
        user_email: data.user_email || user.email,
        attachment_url: data.attachment_url,
        attachment_type: data.attachment_type,
        attachment_name: data.attachment_name
      };
      
      setComments(prevComments => [...prevComments, newComment]);
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('فشل في إضافة التعليق');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    comments,
    isLoading,
    isSubmitting,
    fetchComments,
    addComment
  };
};
