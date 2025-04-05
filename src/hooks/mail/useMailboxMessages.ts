import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/mail/InternalMailApp";

export const useMailboxMessages = (folder: string) => {
  return useQuery({
    queryKey: ['mail-messages', folder],
    queryFn: async () => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("يجب تسجيل الدخول لعرض البريد");
        }
        
        const userId = user.data.user.id;
        
        // جلب الرسائل حسب نوع المجلد
        if (folder === "inbox") {
          // البريد الوارد
          const { data: messages, error } = await supabase
            .from('internal_message_recipients')
            .select(`
              id,
              message_id,
              read_status,
              message:message_id (
                id,
                subject,
                content,
                sender_id,
                created_at,
                is_starred,
                has_attachments,
                sender:profiles!sender_id (
                  id, 
                  display_name, 
                  email
                )
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', false)
            .order('id', { ascending: false });
          
          if (error) {
            console.error("Error fetching inbox messages:", error);
            throw error;
          }
          
          // تحويل البيانات إلى الصيغة المطلوبة
          const formattedMessages = messages && messages.length > 0 ? messages.map(msg => {
            if (!msg.message) return null;
            
            const message = msg.message;
            const sender = message.sender || { id: '', display_name: 'غير معروف', email: '' };
            
            return {
              id: message.id,
              subject: message.subject || 'بدون موضوع',
              content: message.content || '',
              sender: {
                id: sender.id,
                name: sender.display_name || 'غير معروف',
                email: sender.email,
                avatar: null
              },
              recipients: [], // سيتم تعبئتها لاحقًا
              date: message.created_at,
              folder: 'inbox',
              read: msg.read_status === 'read',
              isStarred: message.is_starred,
              labels: [],
              attachments: message.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: 'unknown', path: '' }] : []
            };
          }).filter(Boolean) : [];
          
          return formattedMessages;
          
        } else if (folder === "sent") {
          // البريد الصادر
          const { data: messages, error } = await supabase
            .from('internal_messages')
            .select(`
              id,
              subject,
              content,
              created_at,
              is_starred,
              has_attachments,
              recipients:internal_message_recipients (
                id,
                recipient_id,
                recipient_type,
                recipient:profiles!recipient_id (
                  id, 
                  display_name, 
                  email
                )
              )
            `)
            .eq('sender_id', userId)
            .eq('is_draft', false)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error("Error fetching sent messages:", error);
            throw error;
          }
          
          // تحويل البيانات إلى الصيغة المطلوبة
          const formattedMessages = messages && messages.length > 0 ? messages.map(message => {
            // تجميع المستلمين
            const recipients = message.recipients && message.recipients.length > 0 ? message.recipients.map(r => {
              const recipient = r.recipient || { id: '', display_name: 'غير معروف', email: '' };
              return {
                id: r.recipient_id,
                name: recipient.display_name || 'غير معروف',
                type: r.recipient_type,
                email: recipient.email || ''
              };
            }) : [];
            
            return {
              id: message.id,
              subject: message.subject || 'بدون موضوع',
              content: message.content || '',
              sender: {
                id: userId,
                name: 'أنت',
                avatar: null
              },
              recipients,
              date: message.created_at,
              folder: 'sent',
              read: true, // الرسائل المرسلة دائمًا مقروءة
              isStarred: message.is_starred,
              labels: [],
              attachments: message.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: 'unknown', path: '' }] : []
            };
          }) : [];
          
          return formattedMessages;
          
        } else if (folder === "drafts") {
          // المسودات - نفس التعديلات كما في البريد الصادر
          const { data: messages, error } = await supabase
            .from('internal_messages')
            .select(`
              id,
              subject,
              content,
              created_at,
              is_starred,
              has_attachments,
              recipients:internal_message_recipients (
                id,
                recipient_id,
                recipient_type,
                recipient:profiles!recipient_id (
                  id, 
                  display_name, 
                  email
                )
              )
            `)
            .eq('sender_id', userId)
            .eq('is_draft', true)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error("Error fetching drafts:", error);
            throw error;
          }
          
          const formattedMessages = messages && messages.length > 0 ? messages.map(message => {
            const recipients = message.recipients && message.recipients.length > 0 ? message.recipients.map(r => {
              const recipient = r.recipient || { id: '', display_name: 'غير معروف', email: '' };
              return {
                id: r.recipient_id,
                name: recipient.display_name || 'غير معروف',
                type: r.recipient_type,
                email: recipient.email || ''
              };
            }) : [];
            
            return {
              id: message.id,
              subject: message.subject || 'مسودة',
              content: message.content || '',
              sender: {
                id: userId,
                name: 'أنت',
                avatar: null
              },
              recipients,
              date: message.created_at,
              folder: 'drafts',
              read: true,
              isStarred: message.is_starred,
              labels: [],
              attachments: message.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: 'unknown', path: '' }] : []
            };
          }) : [];
          
          return formattedMessages;
          
        } else if (folder === "trash") {
          // المهملات - نفس التعديلات كما في البريد الوارد
          const { data: messages, error } = await supabase
            .from('internal_message_recipients')
            .select(`
              id,
              message_id,
              read_status,
              message:message_id (
                id,
                subject,
                content,
                sender_id,
                created_at,
                is_starred,
                has_attachments,
                sender:profiles!sender_id (
                  id, 
                  display_name, 
                  email
                )
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', true)
            .order('id', { ascending: false });
          
          if (error) {
            console.error("Error fetching trash messages:", error);
            throw error;
          }
          
          const formattedMessages = messages && messages.length > 0 ? messages.map(msg => {
            if (!msg.message) return null;
            
            const message = msg.message;
            const sender = message.sender || { id: '', display_name: 'غير معروف', email: '' };
            
            return {
              id: message.id,
              subject: message.subject || 'بدون موضوع',
              content: message.content || '',
              sender: {
                id: sender.id,
                name: sender.display_name || 'غير معروف',
                avatar: null
              },
              recipients: [],
              date: message.created_at,
              folder: 'trash',
              read: msg.read_status === 'read',
              isStarred: message.is_starred,
              labels: [],
              attachments: message.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: 'unknown', path: '' }] : []
            };
          }).filter(Boolean) : [];
          
          return formattedMessages;
          
        } else if (folder === "starred") {
          // المميزة بنجمة - نفس التعديلات
          // نفس التعديلات المطلوبة للبريد الوارد والصادر
          return [];
        }
        
        // أي مجلد آخر
        return [];
        
      } catch (err) {
        console.error("Error fetching mailbox messages:", err);
        throw err;
      }
    },
    staleTime: 30000, // تحديث البيانات كل 30 ثانية
  });
};
