
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
        let messages: Message[] = [];
        
        switch (folder) {
          case 'inbox':
            // جلب رسائل البريد الوارد (الرسائل المستلمة)
            const { data: inboxData, error: inboxError } = await supabase
              .from('internal_message_recipients')
              .select(`
                message_id,
                read_status,
                read_at,
                recipient_type,
                message:message_id (
                  id,
                  subject,
                  content,
                  sender_id,
                  created_at,
                  is_starred,
                  has_attachments,
                  sender:sender_id (
                    id, 
                    display_name,
                    email
                  )
                )
              `)
              .eq('recipient_id', userId)
              .eq('is_deleted', false)
              .order('message_id.created_at', { ascending: false });
              
            if (inboxError) throw inboxError;
            
            if (inboxData) {
              // جلب المرفقات للرسائل
              const messageIds = inboxData.map(item => item.message_id);
              
              // جلب المرفقات لكل الرسائل دفعة واحدة
              const { data: attachmentsData } = await supabase
                .from('internal_message_attachments')
                .select('*')
                .in('message_id', messageIds);
                
              // تنظيم المرفقات حسب رسائلها
              const attachmentsByMessage: Record<string, any[]> = {};
              attachmentsData?.forEach(attachment => {
                if (!attachmentsByMessage[attachment.message_id]) {
                  attachmentsByMessage[attachment.message_id] = [];
                }
                attachmentsByMessage[attachment.message_id].push({
                  id: attachment.id,
                  name: attachment.file_name,
                  size: attachment.file_size,
                  type: attachment.file_type,
                  path: attachment.file_path
                });
              });
              
              // تحويل البيانات إلى الشكل المطلوب
              messages = inboxData.map(item => {
                // تجاهل الرسائل المحذوفة (على الرغم من أننا فلترناها في الاستعلام)
                if (!item.message) return null;
                
                return {
                  id: item.message.id,
                  subject: item.message.subject || 'بدون موضوع',
                  content: item.message.content || '',
                  sender: {
                    id: item.message.sender?.id || '',
                    name: item.message.sender?.display_name || 'غير معروف',
                    email: item.message.sender?.email || '',
                    avatar: null
                  },
                  recipients: [], // سنضيف المستلمين لاحقاً
                  date: item.message.created_at,
                  folder: folder as "inbox" | "sent" | "drafts" | "trash" | "starred",
                  read: item.read_status === 'read',
                  isStarred: item.message.is_starred || false,
                  labels: [], // سنضيف التصنيفات لاحقاً
                  attachments: attachmentsByMessage[item.message.id] || []
                };
              }).filter(Boolean) as Message[];
              
              // جلب معلومات المستلمين لكل رسالة
              for (const message of messages) {
                const { data: recipientsData } = await supabase
                  .from('internal_message_recipients')
                  .select(`
                    recipient_id,
                    recipient_type,
                    recipient:recipient_id (
                      id,
                      display_name,
                      email
                    )
                  `)
                  .eq('message_id', message.id);
                  
                if (recipientsData) {
                  message.recipients = recipientsData.map(r => ({
                    id: r.recipient_id,
                    name: r.recipient?.display_name || 'غير معروف',
                    type: r.recipient_type as 'to' | 'cc' | 'bcc',
                    email: r.recipient?.email || ''
                  }));
                }
              }
            }
            break;
            
          case 'sent':
            // جلب الرسائل المرسلة
            const { data: sentData, error: sentError } = await supabase
              .from('internal_messages')
              .select(`
                id,
                subject,
                content,
                created_at,
                is_starred,
                has_attachments
              `)
              .eq('sender_id', userId)
              .eq('is_draft', false)
              .order('created_at', { ascending: false });
              
            if (sentError) throw sentError;
            
            if (sentData) {
              // جلب المرفقات للرسائل
              const sentMessageIds = sentData.map(item => item.id);
              
              // جلب المرفقات لكل الرسائل دفعة واحدة
              const { data: sentAttachmentsData } = await supabase
                .from('internal_message_attachments')
                .select('*')
                .in('message_id', sentMessageIds);
                
              // تنظيم المرفقات حسب رسائلها
              const sentAttachmentsByMessage: Record<string, any[]> = {};
              sentAttachmentsData?.forEach(attachment => {
                if (!sentAttachmentsByMessage[attachment.message_id]) {
                  sentAttachmentsByMessage[attachment.message_id] = [];
                }
                sentAttachmentsByMessage[attachment.message_id].push({
                  id: attachment.id,
                  name: attachment.file_name,
                  size: attachment.file_size,
                  type: attachment.file_type,
                  path: attachment.file_path
                });
              });
              
              // جلب معلومات بيانات المستخدم الحالي كمرسل
              const { data: senderData } = await supabase
                .from('profiles')
                .select('id, display_name, email')
                .eq('id', userId)
                .single();
              
              // تحويل البيانات إلى الشكل المطلوب
              messages = await Promise.all(sentData.map(async (item) => {
                // جلب المستلمين لهذه الرسالة
                const { data: sentRecipientsData } = await supabase
                  .from('internal_message_recipients')
                  .select(`
                    recipient_id,
                    recipient_type,
                    recipient:recipient_id (
                      id,
                      display_name,
                      email
                    )
                  `)
                  .eq('message_id', item.id);
                
                return {
                  id: item.id,
                  subject: item.subject || 'بدون موضوع',
                  content: item.content || '',
                  sender: {
                    id: userId,
                    name: senderData?.display_name || 'أنا',
                    email: senderData?.email || '',
                    avatar: null
                  },
                  recipients: sentRecipientsData?.map(r => ({
                    id: r.recipient_id,
                    name: r.recipient?.display_name || 'غير معروف',
                    type: r.recipient_type as 'to' | 'cc' | 'bcc',
                    email: r.recipient?.email || ''
                  })) || [],
                  date: item.created_at,
                  folder: folder as "inbox" | "sent" | "drafts" | "trash" | "starred",
                  read: true, // الرسائل المرسلة دائماً مقروءة
                  isStarred: item.is_starred || false,
                  labels: [], // سنضيف التصنيفات لاحقاً
                  attachments: sentAttachmentsByMessage[item.id] || []
                };
              }));
            }
            break;
            
          case 'drafts':
            // جلب المسودات
            const { data: draftsData, error: draftsError } = await supabase
              .from('internal_messages')
              .select(`
                id,
                subject,
                content,
                created_at,
                updated_at,
                is_starred,
                has_attachments
              `)
              .eq('sender_id', userId)
              .eq('is_draft', true)
              .order('updated_at', { ascending: false });
              
            if (draftsError) throw draftsError;
            
            if (draftsData) {
              // جلب المرفقات للمسودات
              const draftIds = draftsData.map(item => item.id);
              
              // جلب المرفقات لكل المسودات دفعة واحدة
              const { data: draftAttachmentsData } = await supabase
                .from('internal_message_attachments')
                .select('*')
                .in('message_id', draftIds);
                
              // تنظيم المرفقات حسب مسوداتها
              const draftAttachmentsByMessage: Record<string, any[]> = {};
              draftAttachmentsData?.forEach(attachment => {
                if (!draftAttachmentsByMessage[attachment.message_id]) {
                  draftAttachmentsByMessage[attachment.message_id] = [];
                }
                draftAttachmentsByMessage[attachment.message_id].push({
                  id: attachment.id,
                  name: attachment.file_name,
                  size: attachment.file_size,
                  type: attachment.file_type,
                  path: attachment.file_path
                });
              });
              
              // جلب معلومات بيانات المستخدم الحالي كمرسل
              const { data: draftSenderData } = await supabase
                .from('profiles')
                .select('id, display_name, email')
                .eq('id', userId)
                .single();
              
              // تحويل البيانات إلى الشكل المطلوب
              messages = await Promise.all(draftsData.map(async (item) => {
                // جلب المستلمين لهذه المسودة
                const { data: draftRecipientsData } = await supabase
                  .from('internal_message_recipients')
                  .select(`
                    recipient_id,
                    recipient_type,
                    recipient:recipient_id (
                      id,
                      display_name,
                      email
                    )
                  `)
                  .eq('message_id', item.id);
                
                return {
                  id: item.id,
                  subject: item.subject || 'بدون موضوع',
                  content: item.content || '',
                  sender: {
                    id: userId,
                    name: draftSenderData?.display_name || 'أنا',
                    email: draftSenderData?.email || '',
                    avatar: null
                  },
                  recipients: draftRecipientsData?.map(r => ({
                    id: r.recipient_id,
                    name: r.recipient?.display_name || 'غير معروف',
                    type: r.recipient_type as 'to' | 'cc' | 'bcc',
                    email: r.recipient?.email || ''
                  })) || [],
                  date: item.updated_at || item.created_at,
                  folder: folder as "inbox" | "sent" | "drafts" | "trash" | "starred",
                  read: true,
                  isStarred: item.is_starred || false,
                  labels: [],
                  attachments: draftAttachmentsByMessage[item.id] || []
                };
              }));
            }
            break;
            
          case 'trash':
            // جلب الرسائل المحذوفة (الموجودة في المهملات)
            const { data: trashData, error: trashError } = await supabase
              .from('internal_message_recipients')
              .select(`
                message_id,
                read_status,
                read_at,
                recipient_type,
                message:message_id (
                  id,
                  subject,
                  content,
                  sender_id,
                  created_at,
                  is_starred,
                  has_attachments,
                  sender:sender_id (
                    id, 
                    display_name,
                    email
                  )
                )
              `)
              .eq('recipient_id', userId)
              .eq('is_deleted', true)
              .order('message_id.created_at', { ascending: false });
              
            if (trashError) throw trashError;
            
            if (trashData) {
              // تحويل البيانات إلى الشكل المطلوب
              messages = trashData.map(item => {
                if (!item.message) return null;
                
                return {
                  id: item.message.id,
                  subject: item.message.subject || 'بدون موضوع',
                  content: item.message.content || '',
                  sender: {
                    id: item.message.sender?.id || '',
                    name: item.message.sender?.display_name || 'غير معروف',
                    email: item.message.sender?.email || '',
                    avatar: null
                  },
                  recipients: [], // سنضيفها لاحقًا إذا لزم الأمر
                  date: item.message.created_at,
                  folder: folder as "inbox" | "sent" | "drafts" | "trash" | "starred",
                  read: item.read_status === 'read',
                  isStarred: item.message.is_starred || false,
                  labels: [],
                  attachments: []
                };
              }).filter(Boolean) as Message[];
            }
            break;
            
          case 'starred':
            // جلب الرسائل المميزة بنجمة
            // البريد الوارد المميز بنجمة
            const { data: starredInboxData, error: starredInboxError } = await supabase
              .from('internal_messages')
              .select(`
                id,
                subject,
                content,
                sender_id,
                created_at,
                is_starred,
                has_attachments,
                sender:sender_id (
                  id, 
                  display_name,
                  email
                )
              `)
              .eq('is_starred', true)
              .order('created_at', { ascending: false });
              
            if (starredInboxError) throw starredInboxError;
            
            if (starredInboxData) {
              // البحث عن الرسائل المستلمة من بين الرسائل المميزة
              const starredMessageIds = starredInboxData.map(item => item.id);
              
              // جلب سجلات المستلمين للرسائل المميزة
              const { data: starredRecipientData } = await supabase
                .from('internal_message_recipients')
                .select(`
                  message_id,
                  recipient_id,
                  recipient_type,
                  read_status,
                  is_deleted
                `)
                .in('message_id', starredMessageIds)
                .eq('recipient_id', userId);
                
              // تنظيم بيانات المستلمين حسب الرسالة
              const recipientsByMessageId: Record<string, any> = {};
              starredRecipientData?.forEach(rec => {
                recipientsByMessageId[rec.message_id] = rec;
              });
                
              // تحويل البيانات إلى الشكل المطلوب
              messages = starredInboxData
                .filter(item => {
                  // إعادة الرسائل التي تم إرسالها من المستخدم أو استلامها ولم يحذفها
                  return item.sender_id === userId || 
                    (recipientsByMessageId[item.id] && !recipientsByMessageId[item.id].is_deleted);
                })
                .map(item => {
                  const isReceived = item.sender_id !== userId;
                  
                  return {
                    id: item.id,
                    subject: item.subject || 'بدون موضوع',
                    content: item.content || '',
                    sender: {
                      id: item.sender?.id || '',
                      name: item.sender?.display_name || 'غير معروف',
                      email: item.sender?.email || '',
                      avatar: null
                    },
                    recipients: [], // سنضيفها لاحقًا إذا لزم الأمر
                    date: item.created_at,
                    folder: folder as "inbox" | "sent" | "drafts" | "trash" | "starred",
                    read: isReceived ? (recipientsByMessageId[item.id]?.read_status === 'read') : true,
                    isStarred: true,
                    labels: [],
                    attachments: []
                  };
                });
            }
            break;
            
          default:
            throw new Error("مجلد غير معروف");
        }
        
        return messages;
      } catch (err) {
        console.error("Error fetching mailbox messages:", err);
        throw err;
      }
    },
    staleTime: 30000, // تحديث كل 30 ثانية
  });
};
