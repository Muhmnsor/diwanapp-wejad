
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
            sender:profiles(id, display_name, email)
          `)
          .eq('id', messageId)
          .single();
          
        if (messageError) throw messageError;
        
        if (!messageData) {
          throw new Error("لم يتم العثور على الرسالة");
        }
        
        // الحصول على المستلمين
        const { data: recipients, error: recipientsError } = await supabase
          .from('internal_message_recipients')
          .select(`
            id, recipient_type, read_status, read_at,
            recipient:profiles(id, display_name, email)
          `)
          .eq('message_id', messageId);
          
        if (recipientsError) throw recipientsError;
        
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
            label:internal_message_labels(id, name, color)
          `)
          .eq('message_id', messageId);
          
        if (labelsError) throw labelsError;
        
        // تحديث حالة القراءة تلقائيًا إذا كنت مستلماً
        const currentUser = await supabase.auth.getUser();
        if (currentUser.data.user) {
          const userId = currentUser.data.user.id;
          
          // تحقق ما إذا كان المستخدم الحالي هو أحد المستلمين
          const isRecipient = recipients?.some(r => r.recipient?.id === userId);
          
          if (isRecipient) {
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
        }
        
        // تنسيق البيانات للعرض
        const formattedMessage: Message = {
          id: messageData.id,
          subject: messageData.subject || 'بدون موضوع',
          content: messageData.content || '',
          sender: {
            id: messageData.sender?.id || '',
            name: messageData.sender?.display_name || 'غير معروف',
            email: messageData.sender?.email,
            avatar: null
          },
          recipients: recipients?.map((r) => ({
            id: r.recipient?.id || '',
            name: r.recipient?.display_name || 'غير معروف',
            type: r.recipient_type,
            email: r.recipient?.email || ''
          })) || [],
          date: messageData.created_at,
          folder: messageData.folder as "inbox" | "sent" | "drafts" | "trash" | "starred",
          read: true, // نضع القيمة true لأننا حدثنا حالة القراءة
          isStarred: messageData.is_starred || false,
          labels: labelRelations?.map((lr) => lr.label?.name || '') || [],
          attachments: attachments?.map((attachment) => ({
            id: attachment.id,
            name: attachment.file_name,
            size: attachment.file_size || 0,
            type: attachment.file_type || '',
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
