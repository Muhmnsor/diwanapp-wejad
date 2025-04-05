
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
              message_id,
              read_status,
              internal_messages (
                id,
                subject,
                content,
                sender_id,
                created_at,
                is_starred,
                has_attachments
              ),
              profiles:internal_messages!inner(
                sender:sender_id(id, display_name, email)
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', false)
            .order('message_id', { ascending: false });
          
          if (error) {
            console.error("Error fetching inbox messages:", error);
            throw error;
          }
          
          // تحويل البيانات إلى الصيغة المطلوبة
          const formattedMessages = messages?.map(msg => {
            const message = msg.internal_messages;
            const sender = msg.profiles?.sender?.[0] || { id: '', display_name: 'غير معروف', email: '' };
            
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
          }) || [];
          
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
              recipients:internal_message_recipients(
                recipient_id,
                recipient_type,
                read_status,
                profiles:recipient_id(id, display_name, email)
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
          const formattedMessages = messages?.map(message => {
            // تجميع المستلمين
            const recipients = message.recipients?.map(r => ({
              id: r.recipient_id,
              name: r.profiles?.display_name || 'غير معروف',
              type: r.recipient_type,
              email: r.profiles?.email || ''
            })) || [];
            
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
          }) || [];
          
          return formattedMessages;
          
        } else if (folder === "drafts") {
          // المسودات
          const { data: messages, error } = await supabase
            .from('internal_messages')
            .select(`
              id,
              subject,
              content,
              created_at,
              is_starred,
              has_attachments,
              recipients:internal_message_recipients(
                recipient_id,
                recipient_type,
                profiles:recipient_id(id, display_name, email)
              )
            `)
            .eq('sender_id', userId)
            .eq('is_draft', true)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error("Error fetching drafts:", error);
            throw error;
          }
          
          const formattedMessages = messages?.map(message => {
            const recipients = message.recipients?.map(r => ({
              id: r.recipient_id,
              name: r.profiles?.display_name || 'غير معروف',
              type: r.recipient_type,
              email: r.profiles?.email || ''
            })) || [];
            
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
          }) || [];
          
          return formattedMessages;
          
        } else if (folder === "trash") {
          // المهملات
          const { data: messages, error } = await supabase
            .from('internal_message_recipients')
            .select(`
              message_id,
              read_status,
              internal_messages:message_id (
                id,
                subject,
                content,
                sender_id,
                created_at,
                is_starred,
                has_attachments
              ),
              profiles:internal_messages!inner(
                sender:sender_id(id, display_name, email)
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', true)
            .order('message_id', { ascending: false });
          
          if (error) {
            console.error("Error fetching trash messages:", error);
            throw error;
          }
          
          const formattedMessages = messages?.map(msg => {
            const message = msg.internal_messages;
            const sender = msg.profiles?.sender?.[0] || { id: '', display_name: 'غير معروف', email: '' };
            
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
          }) || [];
          
          return formattedMessages;
          
        } else if (folder === "starred") {
          // المميزة بنجمة
          // البريد الوارد المميز بنجمة
          const { data: inboxStarred, error: inboxError } = await supabase
            .from('internal_message_recipients')
            .select(`
              message_id,
              read_status,
              internal_messages!inner (
                id,
                subject,
                content,
                sender_id,
                created_at,
                is_starred,
                has_attachments
              ),
              profiles:internal_messages!inner(
                sender:sender_id(id, display_name, email)
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', false)
            .eq('internal_messages.is_starred', true);
          
          if (inboxError) {
            console.error("Error fetching starred inbox messages:", inboxError);
            throw inboxError;
          }
          
          // البريد الصادر المميز بنجمة
          const { data: sentStarred, error: sentError } = await supabase
            .from('internal_messages')
            .select(`
              id,
              subject,
              content,
              created_at,
              is_starred,
              has_attachments,
              recipients:internal_message_recipients(
                recipient_id,
                recipient_type,
                profiles:recipient_id(id, display_name, email)
              )
            `)
            .eq('sender_id', userId)
            .eq('is_draft', false)
            .eq('is_starred', true);
          
          if (sentError) {
            console.error("Error fetching starred sent messages:", sentError);
            throw sentError;
          }
          
          // دمج الرسائل المميزة بنجمة
          const inboxMessages = inboxStarred?.map(msg => {
            const message = msg.internal_messages;
            const sender = msg.profiles?.sender?.[0] || { id: '', display_name: 'غير معروف', email: '' };
            
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
              folder: 'inbox',
              read: msg.read_status === 'read',
              isStarred: true,
              labels: [],
              attachments: message.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: 'unknown', path: '' }] : []
            };
          }) || [];
          
          const sentMessages = sentStarred?.map(message => {
            const recipients = message.recipients?.map(r => ({
              id: r.recipient_id,
              name: r.profiles?.display_name || 'غير معروف',
              type: r.recipient_type,
              email: r.profiles?.email || ''
            })) || [];
            
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
              read: true,
              isStarred: true,
              labels: [],
              attachments: message.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: 'unknown', path: '' }] : []
            };
          }) || [];
          
          // دمج وترتيب الرسائل حسب التاريخ
          const allStarredMessages = [...inboxMessages, ...sentMessages]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
          return allStarredMessages;
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
