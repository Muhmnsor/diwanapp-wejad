
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/mail/InternalMailApp";

export const useMessageDetails = (messageId?: string) => {
  return useQuery({
    queryKey: ['mail-message', messageId],
    queryFn: async () => {
      if (!messageId) {
        throw new Error("معرف الرسالة مطلوب");
      }
      
      try {
        // الحصول على بيانات الرسالة الرئيسية
        const { data: messageData, error: messageError } = await supabase
          .from('internal_messages')
          .select(`
            *,
            sender:profiles!sender_id (id, display_name, email),
            recipients:internal_message_recipients (
              id,
              recipient_id,
              recipient_type,
              read_status,
              read_at,
              is_deleted,
              profiles:profiles!recipient_id (id, display_name, email)
            )
          `)
          .eq('id', messageId)
          .single();
          
        if (messageError) throw messageError;
        
        // الحصول على المرفقات
        const { data: attachments, error: attachmentsError } = await supabase
          .from('internal_message_attachments')
          .select('*')
          .eq('message_id', messageId);
          
        if (attachmentsError) throw attachmentsError;
        
        // الحصول على التصنيفات
        const { data: labelRelations, error: labelsError } = await supabase
          .from('internal_message_label_relations')
          .select(`
            *,
            label:label_id (id, name, color)
          `)
          .eq('message_id', messageId);
          
        if (labelsError) throw labelsError;
        
        // تحديث حالة القراءة تلقائيًا
        const currentUser = await supabase.auth.getUser();
        if (currentUser.data.user) {
          const userId = currentUser.data.user.id;
          const { error: readError } = await supabase
            .from('internal_message_recipients')
            .update({ 
              read_status: 'read',
              read_at: new Date().toISOString()
            })
            .eq('message_id', messageId)
            .eq('recipient_id', userId);
          
          if (readError) console.error("Error marking as read:", readError);
        }
        
        // تنسيق البيانات للعرض
        const formattedMessage: Message = {
          id: messageData.id,
          subject: messageData.subject || 'بدون موضوع',
          content: messageData.content || '',
          sender: {
            id: messageData.sender?.id || '',
            name: messageData.sender?.display_name || 'غير معروف',
            avatar: null
          },
          recipients: messageData.recipients?.map((r: any) => ({
            id: r.recipient_id,
            name: r.profiles?.display_name || 'غير معروف',
            type: r.recipient_type,
            email: r.profiles?.email || ''
          })) || [],
          date: messageData.created_at,
          folder: messageData.folder,
          read: true,
          isStarred: messageData.is_starred,
          labels: labelRelations?.map((lr: any) => lr.label?.name || '') || [],
          attachments: attachments?.map((attachment) => ({
            id: attachment.id,
            name: attachment.file_name,
            size: attachment.file_size,
            type: attachment.file_type,
            path: attachment.file_path
          })) || []
        };
        
        return formattedMessage;
      } catch (err) {
        console.error("Error fetching message details:", err);
        throw err;
      }
    },
    enabled: !!messageId,
  });
};
