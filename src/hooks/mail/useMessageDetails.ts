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
            id,
            subject,
            content,
            sender_id,
            folder,
            is_starred,
            has_attachments,
            created_at
          `)
          .eq('id', messageId)
          .single();
          
        if (messageError) throw messageError;
        
        // الحصول على معلومات المرسل
        const { data: senderData, error: senderError } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .eq('id', messageData.sender_id)
          .single();
          
        if (senderError) {
          console.error("Error fetching sender:", senderError);
        }
        
        // الحصول على المستلمين
        const { data: recipientsData, error: recipientsError } = await supabase
          .from('internal_message_recipients')
          .select(`
            id,
            recipient_id,
            recipient_type,
            read_status,
            profiles:profiles!recipient_id (id, display_name, email)
          `)
          .eq('message_id', messageId);
          
        if (recipientsError) {
          console.error("Error fetching recipients:", recipientsError);
        }
        
        // الحصول على المرفقات
        const { data: attachments, error: attachmentsError } = await supabase
          .from('internal_message_attachments')
          .select('id, file_name, file_size, file_type, file_path')
          .eq('message_id', messageId);
          
        if (attachmentsError) {
          console.error("Error fetching attachments:", attachmentsError);
        }
        
        // الحصول على التصنيفات
        const { data: labelRelations, error: labelsError } = await supabase
          .from('internal_message_label_relations')
          .select(`
            id,
            label:internal_message_labels!label_id (id, name, color)
          `)
          .eq('message_id', messageId);
          
        if (labelsError) {
          console.error("Error fetching labels:", labelsError);
        }
        
        // تحديث حالة القراءة تلقائيًا
        const currentUser = await supabase.auth.getUser();
        if (currentUser.data.user) {
          const userId = currentUser.data.user.id;
          await supabase
            .from('internal_message_recipients')
            .update({ 
              read_status: 'read',
              read_at: new Date().toISOString()
            })
            .eq('message_id', messageId)
            .eq('recipient_id', userId);
        }
        
        // تنسيق البيانات للعرض بشكل آمن
        const formattedMessage: Message = {
          id: messageData.id || '',
          subject: messageData.subject || 'بدون موضوع',
          content: messageData.content || '',
          sender: {
            id: senderData?.id || '',
            name: senderData?.display_name || 'غير معروف',
            email: senderData?.email || '',
            avatar: null
          },
          recipients: Array.isArray(recipientsData) ? recipientsData.map(r => ({
            id: r.recipient_id || '',
            name: r.profiles?.display_name || 'غير معروف',
            type: r.recipient_type || 'to',
            email: r.profiles?.email || ''
          })) : [],
          date: messageData.created_at || new Date().toISOString(),
          folder: messageData.folder || 'inbox',
          read: true,
          isStarred: !!messageData.is_starred,
          labels: Array.isArray(labelRelations) ? labelRelations.map(lr => lr.label?.name || '') : [],
          attachments: Array.isArray(attachments) ? attachments.map(attachment => ({
            id: attachment.id || '',
            name: attachment.file_name || '',
            size: attachment.file_size || 0,
            type: attachment.file_type || '',
            path: attachment.file_path || ''
          })) : []
        };
        
        console.log("Formatted message:", formattedMessage);
        return formattedMessage;
      } catch (err) {
        console.error("Error fetching message details:", err);
        throw err;
      }
    },
    enabled: !!messageId,
  });
};
