
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Comment } from '../types';
import { useIdeaNotifications } from '@/hooks/useIdeaNotifications';

export const useComments = (ideaId: string, ideaOwnerId: string, ideaTitle: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const { sendNewCommentNotification } = useIdeaNotifications();

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('idea_comments')
        .select('*, profiles:user_id(display_name)')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform the data to match our Comment type
      const transformedComments = data.map((comment: any) => ({
        ...comment,
        user_name: comment.profiles?.display_name || comment.user_email || 'مستخدم',
      }));
      
      setComments(transformedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('فشل في تحميل التعليقات');
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (content: string, parentId?: string, file?: File) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول لإضافة تعليق');
      return;
    }

    setIsSubmitting(true);

    try {
      let attachmentUrl = null;
      let attachmentName = null;
      let attachmentType = null;

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `idea-comments/${ideaId}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('uploads')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        attachmentUrl = data?.path 
          ? `${supabase.storageUrl}/object/public/uploads/${data.path}`
          : null;
        attachmentName = file.name;
        attachmentType = file.type;
      }

      const newComment = {
        idea_id: ideaId,
        parent_id: parentId || null,
        content,
        user_id: user.id,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType
      };

      const { error, data } = await supabase
        .from('idea_comments')
        .insert([newComment])
        .select('*, profiles:user_id(display_name)')
        .single();

      if (error) throw error;

      // Transform the returned comment
      const transformedComment = {
        ...data,
        user_name: data.profiles?.display_name || data.user_email || 'مستخدم',
      };

      setComments([...comments, transformedComment]);
      
      // Send notification to idea owner if the commenter is not the owner
      if (user.id !== ideaOwnerId) {
        await sendNewCommentNotification({
          ideaId,
          ideaTitle,
          ownerId: ideaOwnerId,
          updatedByUserId: user.id,
          updatedByUserName: user.user_metadata?.name || user.email,
          commentContent: content
        });
      }
      
      toast.success('تم إضافة التعليق بنجاح');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('فشل في إضافة التعليق');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { comments, isLoading, isSubmitting, fetchComments, addComment };
};
