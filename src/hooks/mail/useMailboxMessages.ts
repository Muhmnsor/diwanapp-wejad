
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/mail/InternalMailApp";

export type MailFolder = 'inbox' | 'sent' | 'drafts' | 'trash' | 'starred';

export const useMailboxMessages = (folder: MailFolder = 'inbox') => {
  return useQuery({
    queryKey: ['mail-messages', folder],
    queryFn: async () => {
      try {
        const user = await supabase.auth.getUser();
        const userId = user.data.user?.id;
        
        if (!userId) {
          throw new Error("User is not authenticated");
        }
        
        let query;
        
        // مختلف الاستعلامات بناء على نوع المجلد
        if (folder === 'sent') {
          // البريد المرسل
          query = supabase
            .from('internal_messages')
            .select(`
              id,
              subject,
              content,
              sender_id,
              created_at,
              is_draft,
              folder,
              is_starred,
              sender:profiles!sender_id (id, display_name, email),
              recipients:internal_message_recipients (
                id,
                recipient_id,
                recipient_type,
                profiles:recipient_id (id, display_name, email)
              )
            `)
            .eq('sender_id', userId)
            .eq('is_draft', false)
            .order('created_at', { ascending: false });
        } else if (folder === 'drafts') {
          // المسودات
          query = supabase
            .from('internal_messages')
            .select(`
              id,
              subject,
              content,
              sender_id,
              created_at,
              is_draft,
              folder,
              is_starred,
              sender:profiles!sender_id (id, display_name, email),
              recipients:internal_message_recipients (
                id,
                recipient_id,
                recipient_type,
                profiles:recipient_id (id, display_name, email)
              )
            `)
            .eq('sender_id', userId)
            .eq('is_draft', true)
            .order('created_at', { ascending: false });
        } else if (folder === 'trash') {
          // المهملات
          query = supabase
            .from('internal_message_recipients')
            .select(`
              id,
              recipient_id,
              message_id,
              recipient_type,
              read_status,
              read_at,
              is_deleted,
              message:message_id (
                id,
                subject,
                content,
                sender_id,
                created_at,
                is_draft,
                folder,
                is_starred,
                sender:profiles!sender_id (id, display_name, email)
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', true)
            .order('message.created_at', { ascending: false });
        } else if (folder === 'starred') {
          // الرسائل المميزة
          // البريد الوارد المميز بنجمة
          const inboxQuery = supabase
            .from('internal_message_recipients')
            .select(`
              id,
              recipient_id,
              message_id,
              recipient_type,
              read_status,
              read_at,
              is_deleted,
              message:message_id (
                id,
                subject,
                content,
                sender_id,
                created_at,
                is_draft,
                folder,
                is_starred,
                sender:profiles!sender_id (id, display_name, email)
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', false)
            .eq('message.is_starred', true)
            .order('message.created_at', { ascending: false });
            
          // البريد الصادر المميز بنجمة
          const sentQuery = supabase
            .from('internal_messages')
            .select(`
              id,
              subject,
              content,
              sender_id,
              created_at,
              is_draft,
              folder,
              is_starred,
              sender:profiles!sender_id (id, display_name, email),
              recipients:internal_message_recipients (
                id,
                recipient_id,
                recipient_type,
                profiles:recipient_id (id, display_name, email)
              )
            `)
            .eq('sender_id', userId)
            .eq('is_draft', false)
            .eq('is_starred', true)
            .order('created_at', { ascending: false });
            
          // جمع النتائج
          const [inboxResult, sentResult] = await Promise.all([
            inboxQuery,
            sentQuery
          ]);
          
          const inboxMessages = (inboxResult.data || []).map(processInboxMessage);
          const sentMessages = (sentResult.data || []).map(processSentMessage);
          
          // دمج النتائج وترتيبها حسب التاريخ
          const allMessages = [...inboxMessages, ...sentMessages].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          return allMessages;
        } else {
          // صندوق الوارد (الافتراضي)
          query = supabase
            .from('internal_message_recipients')
            .select(`
              id,
              recipient_id,
              message_id,
              recipient_type,
              read_status,
              read_at,
              is_deleted,
              message:message_id (
                id,
                subject,
                content,
                sender_id,
                created_at,
                is_draft,
                folder,
                is_starred,
                sender:profiles!sender_id (id, display_name, email)
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', false)
            .order('message.created_at', { ascending: false });
        }

        const { data, error } = await query;
        
        if (error) {
          throw error;
        }

        // تحويل البيانات إلى الهيكل المطلوب
        let messages: Message[] = [];
        
        if (folder === 'inbox' || folder === 'trash') {
          messages = (data || []).map(processInboxMessage);
        } else if (folder === 'sent' || folder === 'drafts') {
          messages = (data || []).map(processSentMessage);
        }
        
        return messages;
      } catch (err) {
        console.error("Error fetching mail messages:", err);
        throw err;
      }
    },
    staleTime: 1000 * 60, // تحديث البيانات كل دقيقة
  });
};

// دالة لمعالجة رسائل البريد الوارد
const processInboxMessage = (item: any): Message => {
  const message = item.message || {};
  return {
    id: message.id,
    subject: message.subject || 'بدون موضوع',
    content: message.content || '',
    sender: {
      id: message.sender?.id || '',
      name: message.sender?.display_name || 'غير معروف',
      avatar: null
    },
    recipients: [
      {
        id: item.recipient_id,
        name: '', // سيتم تعبئتها في واجهة المستخدم
        type: item.recipient_type || 'to',
        email: ''
      }
    ],
    date: message.created_at,
    folder: 'inbox',
    read: item.read_status === 'read',
    isStarred: message.is_starred || false,
    labels: [],
    attachments: []
  };
};

// دالة لمعالجة رسائل البريد المرسل والمسودات
const processSentMessage = (message: any): Message => {
  return {
    id: message.id,
    subject: message.subject || 'بدون موضوع',
    content: message.content || '',
    sender: {
      id: message.sender?.id || '',
      name: message.sender?.display_name || 'غير معروف',
      avatar: null
    },
    recipients: Array.isArray(message.recipients) ? message.recipients.map((r: any) => ({
      id: r.recipient_id,
      name: r.profiles?.display_name || 'غير معروف',
      type: r.recipient_type || 'to',
      email: r.profiles?.email || ''
    })) : [],
    date: message.created_at,
    folder: message.is_draft ? 'drafts' : 'sent',
    read: true, // الرسائل المرسلة تعتبر مقروءة دائمًا
    isStarred: message.is_starred || false,
    labels: [],
    attachments: []
  };
};
