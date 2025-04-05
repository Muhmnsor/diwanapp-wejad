
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/mail/InternalMailApp";

export type MailFolder = 'inbox' | 'sent' | 'drafts' | 'trash' | 'starred';

export const useMailboxMessages = (folder: MailFolder = 'inbox') => {
  return useQuery({
    queryKey: ['mail-messages', folder],
    queryFn: async () => {
      try {
        // استخدام الوظيفة المخصصة في Supabase للحصول على رسائل المستخدم
        const { data, error } = await supabase.rpc(
          'get_user_messages',
          { p_folder: folder }
        );
        
        if (error) {
          throw error;
        }
        
        // تحويل البيانات إلى النموذج المطلوب
        const messages: Message[] = (data || []).map((msg: any) => {
          return {
            id: msg.id,
            subject: msg.subject || 'بدون موضوع',
            content: msg.content || '',
            sender: {
              id: msg.sender_id,
              name: msg.sender_name || 'غير معروف',
              avatar: null
            },
            recipients: Array.isArray(msg.recipients) ? msg.recipients : [],
            date: msg.created_at,
            folder: folder,
            read: msg.is_read,
            isStarred: msg.is_starred,
            labels: [],
            attachments: []
          };
        });
        
        return messages;
      } catch (err) {
        console.error("Error fetching mail messages:", err);
        throw err;
      }
    },
    staleTime: 1000 * 60, // تحديث البيانات كل دقيقة
  });
};
