
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/components/mail/InternalMailApp";

export const useMessageOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // إرسال رسالة جديدة
  const sendMessage = useMutation({
    mutationFn: async (data: {
      subject: string;
      content: string;
      recipientIds: { id: string; type: 'to' | 'cc' | 'bcc' }[];
      attachments?: File[];
    }) => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("يجب تسجيل الدخول لإرسال رسائل");
        }
        
        const senderId = user.data.user.id;
        
        // 1. إنشاء الرسالة
        const { data: messageData, error: messageError } = await supabase
          .from('internal_messages')
          .insert({
            subject: data.subject,
            content: data.content,
            sender_id: senderId,
            status: 'sent',
            is_draft: false,
            has_attachments: data.attachments && data.attachments.length > 0
          })
          .select('id')
          .single();
          
        if (messageError) throw messageError;
        
        const messageId = messageData.id;
        
        // 2. إضافة المستلمين
        if (data.recipientIds && data.recipientIds.length > 0) {
          const recipientsToInsert = data.recipientIds.map(r => ({
            message_id: messageId,
            recipient_id: r.id,
            recipient_type: r.type
          }));
          
          const { error: recipientsError } = await supabase
            .from('internal_message_recipients')
            .insert(recipientsToInsert);
            
          if (recipientsError) throw recipientsError;
        }
        
        // 3. رفع المرفقات إذا وجدت
        if (data.attachments && data.attachments.length > 0) {
          for (const file of data.attachments) {
            const fileExt = file.name.split('.').pop();
            const filePath = `${senderId}/${messageId}/${Date.now()}.${fileExt}`;
            
            // رفع الملف إلى التخزين
            const { error: uploadError } = await supabase.storage
              .from('mail_attachments')
              .upload(filePath, file);
              
            if (uploadError) throw uploadError;
            
            // تسجيل المرفق في قاعدة البيانات
            const { error: attachmentError } = await supabase
              .from('internal_message_attachments')
              .insert({
                message_id: messageId,
                file_name: file.name,
                file_path: filePath,
                file_type: file.type,
                file_size: file.size,
                uploaded_by: senderId
              });
              
            if (attachmentError) throw attachmentError;
          }
        }
        
        return { success: true, messageId };
      } catch (error: any) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // تحديث البيانات بعد الإرسال الناجح
      queryClient.invalidateQueries({ queryKey: ['mail-messages'] });
      toast({
        title: "تم الإرسال بنجاح",
        description: "تم إرسال الرسالة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "فشل الإرسال",
        description: error.message || "حدث خطأ أثناء إرسال الرسالة",
        variant: "destructive",
      });
    },
  });

  // حذف رسالة
  const deleteMessage = useMutation({
    mutationFn: async ({ messageId, folder }: { messageId: string, folder: string }) => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("يجب تسجيل الدخول لحذف الرسائل");
        }
        
        if (folder === 'trash') {
          // إذا كانت الرسالة في المهملات، احذفها نهائياً
          const { error } = await supabase
            .from('internal_messages')
            .delete()
            .eq('id', messageId)
            .eq('sender_id', user.data.user.id);
            
          if (error) throw error;
        } else {
          // إذا كانت الرسالة في مجلد آخر، انقلها إلى المهملات
          const { error } = await supabase
            .from('internal_message_recipients')
            .update({ is_deleted: true })
            .eq('message_id', messageId)
            .eq('recipient_id', user.data.user.id);
            
          if (error) throw error;
        }
        
        return { success: true };
      } catch (error: any) {
        console.error("Error deleting message:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // تحديث البيانات بعد الحذف الناجح
      queryClient.invalidateQueries({ queryKey: ['mail-messages', variables.folder] });
      toast({
        title: "تم الحذف بنجاح",
        description: variables.folder === 'trash' 
          ? "تم حذف الرسالة نهائياً" 
          : "تم نقل الرسالة إلى المهملات",
      });
    },
    onError: (error: any) => {
      toast({
        title: "فشل الحذف",
        description: error.message || "حدث خطأ أثناء حذف الرسالة",
        variant: "destructive",
      });
    },
  });

  // تحديث حالة قراءة رسالة
  const markAsRead = useMutation({
    mutationFn: async ({ messageId, read }: { messageId: string, read: boolean }) => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("يجب تسجيل الدخول لتحديث حالة الرسائل");
        }
        
        const { error } = await supabase
          .from('internal_message_recipients')
          .update({ 
            read_status: read ? 'read' : 'unread',
            read_at: read ? new Date().toISOString() : null
          })
          .eq('message_id', messageId)
          .eq('recipient_id', user.data.user.id);
          
        if (error) throw error;
        
        return { success: true };
      } catch (error: any) {
        console.error("Error marking message as read:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mail-messages'] });
    },
  });

  // تحديث حالة النجمة للرسالة
  const toggleStar = useMutation({
    mutationFn: async ({ messageId, isStarred }: { messageId: string, isStarred: boolean }) => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("يجب تسجيل الدخول لتحديث حالة الرسائل");
        }
        
        const { error } = await supabase
          .from('internal_messages')
          .update({ is_starred: isStarred })
          .eq('id', messageId);
          
        if (error) throw error;
        
        return { success: true };
      } catch (error: any) {
        console.error("Error toggling star:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mail-messages'] });
    },
  });

  // حفظ مسودة
  const saveDraft = useMutation({
    mutationFn: async (data: {
      draftId?: string;
      subject: string;
      content: string;
      recipientIds: { id: string; type: 'to' | 'cc' | 'bcc' }[];
    }) => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("يجب تسجيل الدخول لحفظ المسودات");
        }
        
        const senderId = user.data.user.id;
        
        if (data.draftId) {
          // تحديث مسودة موجودة
          const { data: updatedDraft, error } = await supabase
            .from('internal_messages')
            .update({
              subject: data.subject,
              content: data.content,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.draftId)
            .eq('sender_id', senderId)
            .eq('is_draft', true)
            .select('id')
            .single();
            
          if (error) throw error;
          
          // حذف المستلمين السابقين
          await supabase
            .from('internal_message_recipients')
            .delete()
            .eq('message_id', data.draftId);
          
          // إضافة المستلمين الجدد
          if (data.recipientIds && data.recipientIds.length > 0) {
            const recipientsToInsert = data.recipientIds.map(r => ({
              message_id: data.draftId,
              recipient_id: r.id,
              recipient_type: r.type
            }));
            
            const { error: recipientsError } = await supabase
              .from('internal_message_recipients')
              .insert(recipientsToInsert);
              
            if (recipientsError) {
              console.error("Error inserting recipients:", recipientsError);
               throw recipientsError;
          }
          
          return { success: true, draftId: data.draftId };
        } else {
          // إنشاء مسودة جديدة
          const { data: newDraft, error } = await supabase
            .from('internal_messages')
            .insert({
              subject: data.subject,
              content: data.content,
              sender_id: senderId,
              status: 'draft',
              is_draft: true
            })
            .select('id')
            .single();
            
          if (error) throw error;
          
          const draftId = newDraft.id;
          
          // إضافة المستلمين
          if (data.recipientIds && data.recipientIds.length > 0) {
            const recipientsToInsert = data.recipientIds.map(r => ({
              message_id: draftId,
              recipient_id: r.id,
              recipient_type: r.type
            }));
            
            const { error: recipientsError } = await supabase
              .from('internal_message_recipients')
              .insert(recipientsToInsert);
              
            if (recipientsError) throw recipientsError;
          }
          
          return { success: true, draftId };
        }
      } catch (error: any) {
        console.error("Error saving draft:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // تحديث البيانات بعد حفظ المسودة بنجاح
      queryClient.invalidateQueries({ queryKey: ['mail-messages', 'drafts'] });
      toast({
        title: "تم الحفظ",
        description: "تم حفظ المسودة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "فشل حفظ المسودة",
        description: error.message || "حدث خطأ أثناء حفظ المسودة",
        variant: "destructive",
      });
    },
  });

  return {
    sendMessage,
    deleteMessage,
    markAsRead,
    toggleStar,
    saveDraft,
  };
};
