
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
          throw new Error("يجب تسجيل الدخول لعرض الرسائل");
        }
        
        const userId = user.data.user.id;
        let messages: Message[] = [];
        
        // استعلامات محددة بناءً على نوع المجلد
        if (folder === 'inbox') {
          // الرسائل المستلمة (البريد الوارد)
          const { data, error } = await supabase
            .from('internal_message_recipients')
            .select(`
              *,
              message:message_id (
                id,
                subject,
                content,
                created_at,
                is_starred,
                has_attachments,
                sender:sender_id (
                  id,
                  display_name,
                  email
                ),
                attachments:internal_message_attachments (
                  id,
                  file_name,
                  file_path,
                  file_type,
                  file_size
                )
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          messages = (data || []).map(item => ({
            id: item.message.id,
            subject: item.message.subject || 'بدون موضوع',
            content: item.message.content || '',
            sender: {
              id: item.message.sender?.id || '',
              name: item.message.sender?.display_name || 'غير معروف',
              email: item.message.sender?.email || '',
              avatar: null
            },
            recipients: [{ 
              id: userId, 
              name: '', 
              type: item.recipient_type as any,
              email: ''
            }],
            date: item.message.created_at,
            folder: 'inbox',
            read: item.read_status === 'read',
            isStarred: item.message.is_starred,
            labels: [],
            attachments: item.message.attachments?.map(attachment => ({
              id: attachment.id,
              name: attachment.file_name,
              size: attachment.file_size,
              type: attachment.file_type,
              path: attachment.file_path
            })) || []
          }));
          
        } else if (folder === 'sent') {
          // الرسائل المرسلة
          const { data, error } = await supabase
            .from('internal_messages')
            .select(`
              *,
              sender:sender_id (
                id,
                display_name,
                email
              ),
              recipients:internal_message_recipients (
                id,
                recipient_id,
                recipient_type,
                profiles:profiles!recipient_id (
                  id,
                  display_name,
                  email
                )
              ),
              attachments:internal_message_attachments (
                id,
                file_name,
                file_path,
                file_type,
                file_size
              )
            `)
            .eq('sender_id', userId)
            .eq('is_draft', false)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          messages = (data || []).map(item => ({
            id: item.id,
            subject: item.subject || 'بدون موضوع',
            content: item.content || '',
            sender: {
              id: item.sender?.id || '',
              name: item.sender?.display_name || 'غير معروف',
              email: item.sender?.email || '',
              avatar: null
            },
            recipients: item.recipients?.map(r => ({
              id: r.recipient_id,
              name: r.profiles?.display_name || 'غير معروف',
              type: r.recipient_type as any,
              email: r.profiles?.email || ''
            })) || [],
            date: item.created_at,
            folder: 'sent',
            read: true,
            isStarred: item.is_starred,
            labels: [],
            attachments: item.attachments?.map(attachment => ({
              id: attachment.id,
              name: attachment.file_name,
              size: attachment.file_size,
              type: attachment.file_type,
              path: attachment.file_path
            })) || []
          }));
          
        } else if (folder === 'drafts') {
          // المسودات
          const { data, error } = await supabase
            .from('internal_messages')
            .select(`
              *,
              sender:sender_id (
                id,
                display_name,
                email
              ),
              recipients:internal_message_recipients (
                id,
                recipient_id,
                recipient_type,
                profiles:profiles!recipient_id (
                  id,
                  display_name,
                  email
                )
              ),
              attachments:internal_message_attachments (
                id,
                file_name,
                file_path,
                file_type,
                file_size
              )
            `)
            .eq('sender_id', userId)
            .eq('is_draft', true)
            .order('updated_at', { ascending: false });
            
          if (error) throw error;
          
          messages = (data || []).map(item => ({
            id: item.id,
            subject: item.subject || 'مسودة',
            content: item.content || '',
            sender: {
              id: item.sender?.id || '',
              name: item.sender?.display_name || 'غير معروف',
              email: item.sender?.email || '',
              avatar: null
            },
            recipients: item.recipients?.map(r => ({
              id: r.recipient_id,
              name: r.profiles?.display_name || 'غير معروف',
              type: r.recipient_type as any,
              email: r.profiles?.email || ''
            })) || [],
            date: item.created_at,
            folder: 'drafts',
            read: true,
            isStarred: item.is_starred,
            labels: [],
            attachments: item.attachments?.map(attachment => ({
              id: attachment.id,
              name: attachment.file_name,
              size: attachment.file_size,
              type: attachment.file_type,
              path: attachment.file_path
            })) || []
          }));
          
        } else if (folder === 'trash') {
          // المهملات
          const { data, error } = await supabase
            .from('internal_message_recipients')
            .select(`
              *,
              message:message_id (
                id,
                subject,
                content,
                created_at,
                is_starred,
                has_attachments,
                sender:sender_id (
                  id,
                  display_name,
                  email
                ),
                attachments:internal_message_attachments (
                  id,
                  file_name,
                  file_path,
                  file_type,
                  file_size
                )
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', true)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          messages = (data || [])
            .filter(item => item.message) // التأكد من وجود الرسالة
            .map(item => ({
              id: item.message.id,
              subject: item.message.subject || 'بدون موضوع',
              content: item.message.content || '',
              sender: {
                id: item.message.sender?.id || '',
                name: item.message.sender?.display_name || 'غير معروف',
                email: item.message.sender?.email || '',
                avatar: null
              },
              recipients: [{ 
                id: userId, 
                name: '', 
                type: item.recipient_type as any,
                email: ''
              }],
              date: item.message.created_at,
              folder: 'trash',
              read: item.read_status === 'read',
              isStarred: item.message.is_starred,
              labels: [],
              attachments: item.message.attachments?.map(attachment => ({
                id: attachment.id,
                name: attachment.file_name,
                size: attachment.file_size,
                type: attachment.file_type,
                path: attachment.file_path
              })) || []
            }));
            
        } else if (folder === 'starred') {
          // الرسائل المميزة بنجمة
          // استعلام عن الرسائل المستلمة المميزة
          const { data: receivedStarred, error: receivedError } = await supabase
            .from('internal_message_recipients')
            .select(`
              *,
              message:message_id (
                id,
                subject,
                content,
                created_at,
                is_starred,
                has_attachments,
                sender:sender_id (
                  id,
                  display_name,
                  email
                ),
                attachments:internal_message_attachments (
                  id,
                  file_name,
                  file_path,
                  file_type,
                  file_size
                )
              )
            `)
            .eq('recipient_id', userId)
            .eq('is_deleted', false)
            .eq('message.is_starred', true)
            .order('created_at', { ascending: false });
            
          if (receivedError) throw receivedError;
          
          const receivedMessages = (receivedStarred || [])
            .filter(item => item.message && item.message.is_starred) // التأكد من وجود الرسالة
            .map(item => ({
              id: item.message.id,
              subject: item.message.subject || 'بدون موضوع',
              content: item.message.content || '',
              sender: {
                id: item.message.sender?.id || '',
                name: item.message.sender?.display_name || 'غير معروف',
                email: item.message.sender?.email || '',
                avatar: null
              },
              recipients: [{ 
                id: userId, 
                name: '', 
                type: item.recipient_type as any,
                email: ''
              }],
              date: item.message.created_at,
              folder: 'inbox',
              read: item.read_status === 'read',
              isStarred: true,
              labels: [],
              attachments: item.message.attachments?.map(attachment => ({
                id: attachment.id,
                name: attachment.file_name,
                size: attachment.file_size,
                type: attachment.file_type,
                path: attachment.file_path
              })) || []
            }));
            
          // استعلام عن الرسائل المرسلة المميزة
          const { data: sentStarred, error: sentError } = await supabase
            .from('internal_messages')
            .select(`
              *,
              sender:sender_id (
                id,
                display_name,
                email
              ),
              recipients:internal_message_recipients (
                id,
                recipient_id,
                recipient_type,
                profiles:profiles!recipient_id (
                  id,
                  display_name,
                  email
                )
              ),
              attachments:internal_message_attachments (
                id,
                file_name,
                file_path,
                file_type,
                file_size
              )
            `)
            .eq('sender_id', userId)
            .eq('is_draft', false)
            .eq('is_starred', true)
            .order('created_at', { ascending: false });
            
          if (sentError) throw sentError;
          
          const sentMessages = (sentStarred || []).map(item => ({
            id: item.id,
            subject: item.subject || 'بدون موضوع',
            content: item.content || '',
            sender: {
              id: item.sender?.id || '',
              name: item.sender?.display_name || 'غير معروف',
              email: item.sender?.email || '',
              avatar: null
            },
            recipients: item.recipients?.map(r => ({
              id: r.recipient_id,
              name: r.profiles?.display_name || 'غير معروف',
              type: r.recipient_type as any,
              email: r.profiles?.email || ''
            })) || [],
            date: item.created_at,
            folder: 'sent',
            read: true,
            isStarred: true,
            labels: [],
            attachments: item.attachments?.map(attachment => ({
              id: attachment.id,
              name: attachment.file_name,
              size: attachment.file_size,
              type: attachment.file_type,
              path: attachment.file_path
            })) || []
          }));
          
          // جمع الرسائل المستلمة والمرسلة المميزة
          messages = [...receivedMessages, ...sentMessages].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        }
        
        return messages;
      } catch (err) {
        console.error("Error fetching mailbox messages:", err);
        throw err;
      }
    },
    staleTime: 60000, // تحديث البيانات كل دقيقة
  });
};
