
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/mail/InternalMailApp";

export const useMailboxMessages = (folder: string) => {
  return useQuery({
    queryKey: ['mail-messages', folder],
    queryFn: async () => {
      try {
        const currentUser = await supabase.auth.getUser();
        if (!currentUser.data.user) {
          throw new Error("يجب تسجيل الدخول لعرض البريد");
        }
        
        const userId = currentUser.data.user.id;
        let messages: Message[] = [];
        
        // تحديد المجلد الحالي وجلب الرسائل المناسبة
        switch (folder) {
          case 'inbox': {
            // البريد الوارد: الرسائل التي تم استلامها
            const { data, error } = await supabase
              .from('internal_message_recipients')
              .select(`
                message:internal_messages!inner(
                  id, subject, content, sender_id, created_at, is_starred, is_draft,
                  sender:profiles!sender_id(id, display_name, email)
                )
              `)
              .eq('recipient_id', userId)
              .eq('is_deleted', false)
              .order('message.created_at', { ascending: false });
              
            if (error) throw error;
            
            messages = (data || []).map(item => {
              const message = item.message;
              return {
                id: message.id,
                subject: message.subject || 'بدون موضوع',
                content: message.content || '',
                sender: {
                  id: message.sender?.id || '',
                  name: message.sender?.display_name || 'غير معروف',
                  email: message.sender?.email,
                  avatar: null
                },
                recipients: [], // سيتم تعبئتها في useMessageDetails
                date: message.created_at,
                folder: "inbox",
                read: true, // سيتم تحديثها في useMessageDetails
                isStarred: message.is_starred || false,
                labels: [],
                attachments: []
              };
            });
            break;
          }
          case 'sent': {
            // البريد الصادر: الرسائل التي تم إرسالها
            const { data, error } = await supabase
              .from('internal_messages')
              .select(`
                id, subject, content, sender_id, created_at, is_starred, is_draft,
                recipients:internal_message_recipients(
                  id, recipient_type,
                  recipient:profiles!recipient_id(id, display_name, email)
                )
              `)
              .eq('sender_id', userId)
              .eq('is_draft', false)
              .order('created_at', { ascending: false });
              
            if (error) throw error;
            
            messages = (data || []).map(message => {
              const firstRecipient = message.recipients && message.recipients.length > 0 
                ? message.recipients[0].recipient 
                : null;
                
              return {
                id: message.id,
                subject: message.subject || 'بدون موضوع',
                content: message.content || '',
                sender: {
                  id: userId,
                  name: 'أنا',
                  email: currentUser.data.user?.email,
                  avatar: null
                },
                recipients: (message.recipients || []).map(r => ({
                  id: r.recipient?.id || '',
                  name: r.recipient?.display_name || 'غير معروف',
                  type: r.recipient_type,
                  email: r.recipient?.email || ''
                })),
                date: message.created_at,
                folder: "sent",
                read: true,
                isStarred: message.is_starred || false,
                labels: [],
                attachments: []
              };
            });
            break;
          }
          case 'drafts': {
            // المسودات: الرسائل التي لم يتم إرسالها بعد
            const { data, error } = await supabase
              .from('internal_messages')
              .select(`
                id, subject, content, sender_id, created_at, is_starred, is_draft,
                recipients:internal_message_recipients(
                  id, recipient_type,
                  recipient:profiles!recipient_id(id, display_name, email)
                )
              `)
              .eq('sender_id', userId)
              .eq('is_draft', true)
              .order('created_at', { ascending: false });
              
            if (error) throw error;
            
            messages = (data || []).map(message => {
              return {
                id: message.id,
                subject: message.subject || 'مسودة',
                content: message.content || '',
                sender: {
                  id: userId,
                  name: 'أنا',
                  email: currentUser.data.user?.email,
                  avatar: null
                },
                recipients: (message.recipients || []).map(r => ({
                  id: r.recipient?.id || '',
                  name: r.recipient?.display_name || 'غير معروف',
                  type: r.recipient_type,
                  email: r.recipient?.email || ''
                })),
                date: message.created_at,
                folder: "drafts",
                read: true,
                isStarred: message.is_starred || false,
                labels: [],
                attachments: []
              };
            });
            break;
          }
          case 'trash': {
            // المهملات: الرسائل التي تم حذفها
            const { data, error } = await supabase
              .from('internal_message_recipients')
              .select(`
                message:internal_messages!inner(
                  id, subject, content, sender_id, created_at, is_starred, is_draft,
                  sender:profiles!sender_id(id, display_name, email)
                )
              `)
              .eq('recipient_id', userId)
              .eq('is_deleted', true)
              .order('message.created_at', { ascending: false });
              
            if (error) throw error;
            
            messages = (data || []).map(item => {
              const message = item.message;
              return {
                id: message.id,
                subject: message.subject || 'بدون موضوع',
                content: message.content || '',
                sender: {
                  id: message.sender?.id || '',
                  name: message.sender?.display_name || 'غير معروف',
                  email: message.sender?.email,
                  avatar: null
                },
                recipients: [], // سيتم تعبئتها في useMessageDetails
                date: message.created_at,
                folder: "trash",
                read: true,
                isStarred: message.is_starred || false,
                labels: [],
                attachments: []
              };
            });
            break;
          }
          case 'starred': {
            // الرسائل المميزة بنجمة
            // رسائل مستلمة مميزة بنجمة
            const { data: receivedData, error: receivedError } = await supabase
              .from('internal_message_recipients')
              .select(`
                message:internal_messages!inner(
                  id, subject, content, sender_id, created_at, is_starred, is_draft,
                  sender:profiles!sender_id(id, display_name, email)
                )
              `)
              .eq('recipient_id', userId)
              .eq('is_deleted', false)
              .eq('message.is_starred', true)
              .order('message.created_at', { ascending: false });
              
            if (receivedError) throw receivedError;
            
            // رسائل مرسلة مميزة بنجمة
            const { data: sentData, error: sentError } = await supabase
              .from('internal_messages')
              .select(`
                id, subject, content, sender_id, created_at, is_starred, is_draft,
                recipients:internal_message_recipients(
                  id, recipient_type,
                  recipient:profiles!recipient_id(id, display_name, email)
                )
              `)
              .eq('sender_id', userId)
              .eq('is_starred', true)
              .order('created_at', { ascending: false });
              
            if (sentError) throw sentError;
            
            // دمج الرسائل المستلمة
            const receivedMessages = (receivedData || []).map(item => {
              const message = item.message;
              return {
                id: message.id,
                subject: message.subject || 'بدون موضوع',
                content: message.content || '',
                sender: {
                  id: message.sender?.id || '',
                  name: message.sender?.display_name || 'غير معروف',
                  email: message.sender?.email,
                  avatar: null
                },
                recipients: [], // سيتم تعبئتها في useMessageDetails
                date: message.created_at,
                folder: "inbox",
                read: true,
                isStarred: true,
                labels: [],
                attachments: []
              };
            });
            
            // دمج الرسائل المرسلة
            const sentMessages = (sentData || []).map(message => {
              return {
                id: message.id,
                subject: message.subject || 'بدون موضوع',
                content: message.content || '',
                sender: {
                  id: userId,
                  name: 'أنا',
                  email: currentUser.data.user?.email,
                  avatar: null
                },
                recipients: (message.recipients || []).map(r => ({
                  id: r.recipient?.id || '',
                  name: r.recipient?.display_name || 'غير معروف',
                  type: r.recipient_type,
                  email: r.recipient?.email || ''
                })),
                date: message.created_at,
                folder: message.is_draft ? "drafts" : "sent",
                read: true,
                isStarred: true,
                labels: [],
                attachments: []
              };
            });
            
            // دمج جميع الرسائل وترتيبها حسب التاريخ
            messages = [...receivedMessages, ...sentMessages].sort((a, b) => {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            break;
          }
        }
        
        console.log(`Fetched ${messages.length} messages for folder ${folder}`);
        return messages;
      } catch (err) {
        console.error("Error fetching mailbox messages:", err);
        throw err;
      }
    },
    staleTime: 30000, // تحديث البيانات كل 30 ثانية
  });
};
