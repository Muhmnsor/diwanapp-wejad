
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Comment } from '../types';
import { toast } from 'sonner';
import { useIdeaNotifications } from '@/hooks/useIdeaNotifications';

// Define a type for the profiles object to help TypeScript understand the structure
type ProfileData = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
};

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
        .select(`
          id, 
          content, 
          created_at, 
          updated_at, 
          user_id, 
          parent_id, 
          attachment_url, 
          attachment_name,
          profiles:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }
      
      // Transform the comments data to include user info
      const transformedComments = data.map((comment: any) => {
        let profileData: ProfileData | null = null;
        
        // Safely extract profile data regardless of its structure
        if (comment.profiles) {
          if (Array.isArray(comment.profiles) && comment.profiles.length > 0) {
            profileData = comment.profiles[0];
          } else {
            profileData = comment.profiles as ProfileData;
          }
        }
        
        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          user_id: comment.user_id,
          parent_id: comment.parent_id,
          idea_id: ideaId,
          attachment_url: comment.attachment_url,
          attachment_name: comment.attachment_name,
          user: profileData ? {
            id: profileData.id,
            email: profileData.email,
            name: profileData.full_name,
            avatar_url: profileData.avatar_url
          } : null
        };
      });
      
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
      
      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('comment-attachments')
          .upload(fileName, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from('comment-attachments')
          .getPublicUrl(fileName);
          
        attachment_url = urlData.publicUrl;
        attachment_name = file.name;
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
          attachment_name
        })
        .select(`
          id, 
          content, 
          created_at, 
          updated_at, 
          user_id, 
          parent_id, 
          attachment_url, 
          attachment_name,
          profiles:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
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
      
      // Process the new comment data
      let profileData: ProfileData | null = null;
      
      // Safely extract profile data
      if (data.profiles) {
        if (Array.isArray(data.profiles) && data.profiles.length > 0) {
          profileData = data.profiles[0];
        } else {
          profileData = data.profiles as ProfileData;
        }
      }
      
      // Add the new comment to the state
      const newComment = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: data.user_id,
        parent_id: data.parent_id,
        idea_id: ideaId,
        attachment_url: data.attachment_url,
        attachment_name: data.attachment_name,
        user: profileData ? {
          id: profileData.id,
          email: profileData.email,
          name: profileData.full_name,
          avatar_url: profileData.avatar_url
        } : null
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
