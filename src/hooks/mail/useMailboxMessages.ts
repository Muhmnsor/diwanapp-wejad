
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/mail/InternalMailApp";

export const useMailboxMessages = (folder: string) => {
  return useQuery({
    queryKey: ['mailbox-messages', folder],
    queryFn: async () => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("يجب تسجيل الدخول لعرض البريد");
        }
        
        const userId = user.data.user.id;
        let messages: Message[] = [];
        
        if (folder === "inbox") {
          // الرسائل الواردة: الرسائل التي تم استلامها ولم يتم حذفها
          const { data, error } = await supabase
            .from('internal_message_recipients')
            .select(`
              id, read_status, recipient_type,
              message:internal_messages!message_id (
                id, subject, content, sender_id, created_at, is_starred, has_attachments,
                sender:profiles!sender_id (id, display_name, email)
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', false)
            .order('message(created_at)', { ascending: false });
            
          if (error) throw error;
          
          // الحصول على المرفقات لكل رسالة
          messages = await Promise.all(
            data.map(async (item) => {
              const message = item.message;
              if (!message) return null;
              
              const { data: attachments } = await supabase
                .from('internal_message_attachments')
                .select('*')
                .eq('message_id', message.id);
                
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
                recipients: [{
                  id: userId,
                  name: 'أنا',
                  type: item.recipient_type
                }],
                date: message.created_at,
                folder: "inbox" as const,
                read: item.read_status === 'read',
                isStarred: message.is_starred || false,
                labels: [], // سيتم تحميلها عند عرض التفاصيل
                attachments: (attachments || []).map(att => ({
                  id: att.id,
                  name: att.file_name,
                  size: att.file_size || 0,
                  type: att.file_type || '',
                  path: att.file_path
                }))
              };
            })
          );
          
        } else if (folder === "sent") {
          // الرسائل المرسلة: الرسائل التي أرسلها المستخدم وليست مسودات
          const { data, error } = await supabase
            .from('internal_messages')
            .select(`
              *,
              recipients:internal_message_recipients!message_id (
                id, recipient_id, recipient_type,
                recipient:profiles!recipient_id (id, display_name, email)
              )
            `)
            .eq('sender_id', userId)
            .eq('is_draft', false)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          messages = await Promise.all(
            data.map(async (message) => {
              const { data: attachments } = await supabase
                .from('internal_message_attachments')
                .select('*')
                .eq('message_id', message.id);
                
              // الحصول على معلومات المرسل
              const { data: senderData } = await supabase
                .from('profiles')
                .select('id, display_name, email')
                .eq('id', userId)
                .single();
                
              return {
                id: message.id,
                subject: message.subject || 'بدون موضوع',
                content: message.content || '',
                sender: {
                  id: senderData?.id || userId,
                  name: senderData?.display_name || 'أنا',
                  email: senderData?.email,
                  avatar: null
                },
                recipients: message.recipients?.map((r: any) => ({
                  id: r.recipient?.id || '',
                  name: r.recipient?.display_name || 'غير معروف',
                  type: r.recipient_type,
                  email: r.recipient?.email
                })) || [],
                date: message.created_at,
                folder: "sent" as const,
                read: true, // الرسائل المرسلة تكون مقروءة تلقائياً
                isStarred: message.is_starred || false,
                labels: [], // سيتم تحميلها عند عرض التفاصيل
                attachments: (attachments || []).map(att => ({
                  id: att.id,
                  name: att.file_name,
                  size: att.file_size || 0,
                  type: att.file_type || '',
                  path: att.file_path
                }))
              };
            })
          );
          
        } else if (folder === "drafts") {
          // المسودات: الرسائل التي بدأها المستخدم ولم يتم إرسالها بعد
          const { data, error } = await supabase
            .from('internal_messages')
            .select(`
              *,
              recipients:internal_message_recipients!message_id (
                id, recipient_id, recipient_type,
                recipient:profiles!recipient_id (id, display_name, email)
              )
            `)
            .eq('sender_id', userId)
            .eq('is_draft', true)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          messages = await Promise.all(
            data.map(async (message) => {
              const { data: attachments } = await supabase
                .from('internal_message_attachments')
                .select('*')
                .eq('message_id', message.id);
                
              // الحصول على معلومات المرسل
              const { data: senderData } = await supabase
                .from('profiles')
                .select('id, display_name, email')
                .eq('id', userId)
                .single();
                
              return {
                id: message.id,
                subject: message.subject || 'بدون موضوع',
                content: message.content || '',
                sender: {
                  id: senderData?.id || userId,
                  name: senderData?.display_name || 'أنا',
                  email: senderData?.email,
                  avatar: null
                },
                recipients: message.recipients?.map((r: any) => ({
                  id: r.recipient?.id || '',
                  name: r.recipient?.display_name || 'غير معروف',
                  type: r.recipient_type,
                  email: r.recipient?.email
                })) || [],
                date: message.created_at,
                folder: "drafts" as const,
                read: true, // المسودات تكون مقروءة تلقائياً
                isStarred: message.is_starred || false,
                labels: [], // سيتم تحميلها عند عرض التفاصيل
                attachments: (attachments || []).map(att => ({
                  id: att.id,
                  name: att.file_name,
                  size: att.file_size || 0,
                  type: att.file_type || '',
                  path: att.file_path
                }))
              };
            })
          );
          
        } else if (folder === "trash") {
          // المهملات: الرسائل التي تم حذفها
          const { data, error } = await supabase
            .from('internal_message_recipients')
            .select(`
              id, read_status, recipient_type,
              message:internal_messages!message_id (
                id, subject, content, sender_id, created_at, is_starred, has_attachments,
                sender:profiles!sender_id (id, display_name, email)
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', true)
            .order('message(created_at)', { ascending: false });
            
          if (error) throw error;
          
          messages = await Promise.all(
            data.map(async (item) => {
              const message = item.message;
              if (!message) return null;
              
              const { data: attachments } = await supabase
                .from('internal_message_attachments')
                .select('*')
                .eq('message_id', message.id);
                
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
                recipients: [{
                  id: userId,
                  name: 'أنا',
                  type: item.recipient_type
                }],
                date: message.created_at,
                folder: "trash" as const,
                read: item.read_status === 'read',
                isStarred: message.is_starred || false,
                labels: [], // سيتم تحميلها عند عرض التفاصيل
                attachments: (attachments || []).map(att => ({
                  id: att.id,
                  name: att.file_name,
                  size: att.file_size || 0,
                  type: att.file_type || '',
                  path: att.file_path
                }))
              };
            })
          );
          
        } else if (folder === "starred") {
          // الرسائل المميزة بنجمة
          // المميزة بنجمة: الرسائل الواردة والمرسلة المميزة بنجمة
          const { data: inboxStarred, error: inboxError } = await supabase
            .from('internal_message_recipients')
            .select(`
              id, read_status, recipient_type,
              message:internal_messages!inner (
                id, subject, content, sender_id, created_at, is_starred, has_attachments,
                sender:profiles!sender_id (id, display_name, email)
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', false)
            .eq('message.is_starred', true)
            .order('message(created_at)', { ascending: false });
            
          if (inboxError) throw inboxError;
          
          const { data: sentStarred, error: sentError } = await supabase
            .from('internal_messages')
            .select(`
              *,
              recipients:internal_message_recipients!message_id (
                id, recipient_id, recipient_type,
                recipient:profiles!recipient_id (id, display_name, email)
              )
            `)
            .eq('sender_id', userId)
            .eq('is_starred', true)
            .order('created_at', { ascending: false });
            
          if (sentError) throw sentError;
          
          // الرسائل المميزة بنجمة من البريد الوارد
          const inboxMessages = await Promise.all(
            inboxStarred.map(async (item) => {
              const message = item.message;
              if (!message) return null;
              
              const { data: attachments } = await supabase
                .from('internal_message_attachments')
                .select('*')
                .eq('message_id', message.id);
                
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
                recipients: [{
                  id: userId,
                  name: 'أنا',
                  type: item.recipient_type
                }],
                date: message.created_at,
                folder: "starred" as const,
                read: item.read_status === 'read',
                isStarred: true,
                labels: [], // سيتم تحميلها عند عرض التفاصيل
                attachments: (attachments || []).map(att => ({
                  id: att.id,
                  name: att.file_name,
                  size: att.file_size || 0,
                  type: att.file_type || '',
                  path: att.file_path
                }))
              };
            })
          );
          
          // الرسائل المميزة بنجمة من المرسلة
          const sentMessages = await Promise.all(
            sentStarred.map(async (message) => {
              const { data: attachments } = await supabase
                .from('internal_message_attachments')
                .select('*')
                .eq('message_id', message.id);
                
              // الحصول على معلومات المرسل
              const { data: senderData } = await supabase
                .from('profiles')
                .select('id, display_name, email')
                .eq('id', userId)
                .single();
                
              return {
                id: message.id,
                subject: message.subject || 'بدون موضوع',
                content: message.content || '',
                sender: {
                  id: senderData?.id || userId,
                  name: senderData?.display_name || 'أنا',
                  email: senderData?.email,
                  avatar: null
                },
                recipients: message.recipients?.map((r: any) => ({
                  id: r.recipient?.id || '',
                  name: r.recipient?.display_name || 'غير معروف',
                  type: r.recipient_type,
                  email: r.recipient?.email
                })) || [],
                date: message.created_at,
                folder: "starred" as const,
                read: true,
                isStarred: true,
                labels: [], // سيتم تحميلها عند عرض التفاصيل
                attachments: (attachments || []).map(att => ({
                  id: att.id,
                  name: att.file_name,
                  size: att.file_size || 0,
                  type: att.file_type || '',
                  path: att.file_path
                }))
              };
            })
          );
          
          // دمج القوائم
          messages = [...inboxMessages, ...sentMessages].filter(Boolean).sort((a, b) => 
            new Date(b!.date).getTime() - new Date(a!.date).getTime()
          ) as Message[];
        }
        
        // تصفية الرسائل التي قد تكون null
        return messages.filter(Boolean);
      } catch (err) {
        console.error("Error fetching mailbox messages:", err);
        return [];
      }
    },
  });
};
