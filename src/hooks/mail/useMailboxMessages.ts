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
        let formattedMessages: Message[] = [];
        
        // استعلام البريد الوارد
        if (folder === "inbox") {
          const { data, error } = await supabase.rpc('get_user_messages', {
            p_user_id: userId,
            p_folder: 'inbox'
          });
          
          if (error) {
            console.error("Error fetching inbox messages:", error);
            throw error;
          }
          
          formattedMessages = (data || []).map(msg => ({
            id: msg.id,
            subject: msg.subject || 'بدون موضوع',
            content: msg.content || '',
            sender: {
              id: msg.sender_id,
              name: msg.sender_name || 'غير معروف',
              email: '',
              avatar: null
            },
            recipients: Array.isArray(msg.recipients) ? msg.recipients.map((r: any) => ({
              id: r.id,
              name: r.name,
              type: r.type || 'to',
              email: ''
            })) : [],
            date: msg.created_at,
            folder: "inbox",
            read: msg.is_read,
            isStarred: msg.is_starred,
            labels: [],
            attachments: msg.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: 'unknown', path: '' }] : []
          }));
        }
        
        // استعلام البريد الصادر
        else if (folder === "sent") {
          const { data, error } = await supabase.rpc('get_user_messages', {
            p_user_id: userId,
            p_folder: 'sent'
          });
          
          if (error) {
            console.error("Error fetching sent messages:", error);
            throw error;
          }
          
          formattedMessages = (data || []).map(msg => ({
            id: msg.id,
            subject: msg.subject || 'بدون موضوع',
            content: msg.content || '',
            sender: {
              id: msg.sender_id,
              name: msg.sender_name || 'أنت',
              email: '',
              avatar: null
            },
            recipients: Array.isArray(msg.recipients) ? msg.recipients.map((r: any) => ({
              id: r.id,
              name: r.name,
              type: r.type || 'to',
              email: ''
            })) : [],
            date: msg.created_at,
            folder: "sent",
            read: true, // الرسائل المرسلة دائمًا مقروءة
            isStarred: msg.is_starred,
            labels: [],
            attachments: msg.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: 'unknown', path: '' }] : []
          }));
        }
        
        // استعلام المسودات
        else if (folder === "drafts") {
          const { data, error } = await supabase.rpc('get_user_messages', {
            p_user_id: userId,
            p_folder: 'drafts'
          });
          
          if (error) {
            console.error("Error fetching drafts:", error);
            throw error;
          }
          
          formattedMessages = (data || []).map(msg => ({
            id: msg.id,
            subject: msg.subject || 'مسودة',
            content: msg.content || '',
            sender: {
              id: msg.sender_id,
              name: msg.sender_name || 'أنت',
              email: '',
              avatar: null
            },
            recipients: Array.isArray(msg.recipients) ? msg.recipients.map((r: any) => ({
              id: r.id,
              name: r.name,
              type: r.type || 'to',
              email: ''
            })) : [],
            date: msg.created_at,
            folder: "drafts",
            read: true,
            isStarred: msg.is_starred,
            labels: [],
            attachments: msg.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: 'unknown', path: '' }] : []
          }));
        }
        
        // استعلام المهملات
        else if (folder === "trash") {
          const { data, error } = await supabase.rpc('get_user_messages', {
            p_user_id: userId,
            p_folder: 'trash'
          });
          
          if (error) {
            console.error("Error fetching trash messages:", error);
            throw error;
          }
          
          formattedMessages = (data || []).map(msg => ({
            id: msg.id,
            subject: msg.subject || 'بدون موضوع',
            content: msg.content || '',
            sender: {
              id: msg.sender_id,
              name: msg.sender_name || 'غير معروف',
              email: '',
              avatar: null
            },
            recipients: Array.isArray(msg.recipients) ? msg.recipients.map((r: any) => ({
              id: r.id,
              name: r.name,
              type: r.type || 'to',
              email: ''
            })) : [],
            date: msg.created_at,
            folder: "trash",
            read: msg.is_read,
            isStarred: msg.is_starred,
            labels: [],
            attachments: msg.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: 'unknown', path: '' }] : []
          }));
        }
        
        // استعلام المميزة بنجمة
        else if (folder === "starred") {
          const { data, error } = await supabase.rpc('get_user_messages', {
            p_user_id: userId,
            p_folder: 'starred'
          });
          
          if (error) {
            console.error("Error fetching starred messages:", error);
            throw error;
          }
          
          formattedMessages = (data || []).map(msg => ({
            id: msg.id,
            subject: msg.subject || 'بدون موضوع',
            content: msg.content || '',
            sender: {
              id: msg.sender_id,
              name: msg.sender_name || 'غير معروف',
              email: '',
              avatar: null
            },
            recipients: Array.isArray(msg.recipients) ? msg.recipients.map((r: any) => ({
              id: r.id,
              name: r.name,
              type: r.type || 'to',
              email: ''
            })) : [],
            date: msg.created_at,
            folder: "starred",
            read: msg.is_read,
            isStarred: true,
            labels: [],
            attachments: msg.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: 'unknown', path: '' }] : []
          }));
        }
        
        console.log(`Fetched ${formattedMessages.length} messages for folder ${folder}`);
        return formattedMessages;
        
      } catch (err) {
        console.error("Error fetching mailbox messages:", err);
        throw err;
      }
    },
    staleTime: 30000, // تحديث البيانات كل 30 ثانية
    retry: 1,
  });
};
