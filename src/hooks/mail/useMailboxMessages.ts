
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

        // مختلف استراتيجيات الاستعلام بناء على نوع المجلد
        switch (folder) {
          case 'inbox': {
            // الرسائل الواردة (التي تلقاها المستخدم وليست محذوفة)
            const { data: recipientMessages, error: inboxError } = await supabase
              .from('internal_message_recipients')
              .select(`
                message_id,
                read_status,
                recipient_type,
                internal_messages (
                  id,
                  subject,
                  content,
                  sender_id,
                  created_at,
                  is_starred,
                  has_attachments,
                  sender:profiles!sender_id (id, display_name, email)
                )
              `)
              .eq('recipient_id', userId)
              .eq('is_deleted', false)
              .order('message_id.created_at', { ascending: false });
            
            if (inboxError) {
              console.error("Error fetching inbox messages:", inboxError);
              throw inboxError;
            }

            if (recipientMessages && recipientMessages.length > 0) {
              messages = recipientMessages.map((item) => {
                const message = item.internal_messages;
                const sender = Array.isArray(message.sender) ? message.sender[0] : message.sender;
                
                return {
                  id: message.id,
                  subject: message.subject || "بدون موضوع",
                  content: message.content || "",
                  sender: {
                    id: sender?.id || "",
                    name: sender?.display_name || "غير معروف",
                    email: sender?.email,
                    avatar: null
                  },
                  recipients: [], // سيتم ملؤها لاحقاً
                  date: message.created_at,
                  folder: "inbox",
                  read: item.read_status === 'read',
                  isStarred: message.is_starred || false,
                  labels: [],
                  attachments: message.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: '', path: '' }] : []
                };
              });
              
              // الحصول على المستلمين لكل رسالة
              for (const message of messages) {
                const { data: recipients, error: recipientsError } = await supabase
                  .from('internal_message_recipients')
                  .select(`
                    recipient_id,
                    recipient_type,
                    profiles!recipient_id (id, display_name, email)
                  `)
                  .eq('message_id', message.id);
                
                if (!recipientsError && recipients) {
                  message.recipients = recipients.map(rec => {
                    const profile = rec.profiles;
                    return {
                      id: rec.recipient_id,
                      name: profile?.display_name || "غير معروف",
                      type: rec.recipient_type,
                      email: profile?.email || ""
                    };
                  });
                }
              }
            }
            break;
          }
          
          case 'sent': {
            // الرسائل المرسلة من قبل المستخدم
            const { data: sentMessages, error: sentError } = await supabase
              .from('internal_messages')
              .select(`
                id,
                subject,
                content,
                created_at,
                is_draft,
                is_starred,
                has_attachments,
                sender:profiles!sender_id (id, display_name, email)
              `)
              .eq('sender_id', userId)
              .eq('is_draft', false)
              .order('created_at', { ascending: false });
            
            if (sentError) {
              console.error("Error fetching sent messages:", sentError);
              throw sentError;
            }
            
            if (sentMessages && sentMessages.length > 0) {
              messages = await Promise.all(sentMessages.map(async (message) => {
                // الحصول على المستلمين للرسالة
                const { data: recipients, error: recipientsError } = await supabase
                  .from('internal_message_recipients')
                  .select(`
                    recipient_id,
                    recipient_type,
                    profiles!recipient_id (id, display_name, email)
                  `)
                  .eq('message_id', message.id);
                
                let recipientsList = [];
                if (!recipientsError && recipients) {
                  recipientsList = recipients.map(rec => {
                    const profile = rec.profiles;
                    return {
                      id: rec.recipient_id,
                      name: profile?.display_name || "غير معروف",
                      type: rec.recipient_type,
                      email: profile?.email || ""
                    };
                  });
                }

                const sender = Array.isArray(message.sender) ? message.sender[0] : message.sender;
                
                return {
                  id: message.id,
                  subject: message.subject || "بدون موضوع",
                  content: message.content || "",
                  sender: {
                    id: sender?.id || "",
                    name: sender?.display_name || "غير معروف",
                    email: sender?.email,
                    avatar: null
                  },
                  recipients: recipientsList,
                  date: message.created_at,
                  folder: "sent",
                  read: true, // الرسائل المرسلة تعتبر مقروءة دائماً
                  isStarred: message.is_starred || false,
                  labels: [],
                  attachments: message.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: '', path: '' }] : []
                };
              }));
            }
            break;
          }
          
          case 'drafts': {
            // المسودات (الرسائل غير المرسلة)
            const { data: drafts, error: draftsError } = await supabase
              .from('internal_messages')
              .select(`
                id,
                subject,
                content,
                created_at,
                is_starred,
                has_attachments,
                sender:profiles!sender_id (id, display_name, email)
              `)
              .eq('sender_id', userId)
              .eq('is_draft', true)
              .order('created_at', { ascending: false });
            
            if (draftsError) {
              console.error("Error fetching draft messages:", draftsError);
              throw draftsError;
            }
            
            if (drafts && drafts.length > 0) {
              messages = drafts.map(message => {
                const sender = Array.isArray(message.sender) ? message.sender[0] : message.sender;
                
                return {
                  id: message.id,
                  subject: message.subject || "مسودة",
                  content: message.content || "",
                  sender: {
                    id: sender?.id || "",
                    name: sender?.display_name || "غير معروف",
                    email: sender?.email,
                    avatar: null
                  },
                  recipients: [], // المسودات قد لا يكون لها مستلمون بعد
                  date: message.created_at,
                  folder: "drafts",
                  read: true,
                  isStarred: message.is_starred || false,
                  labels: [],
                  attachments: message.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: '', path: '' }] : []
                };
              });
            }
            break;
          }
          
          case 'trash': {
            // الرسائل المحذوفة (سلة المهملات)
            const { data: deletedMessages, error: trashError } = await supabase
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
                  has_attachments,
                  sender:profiles!sender_id (id, display_name, email)
                )
              `)
              .eq('recipient_id', userId)
              .eq('is_deleted', true)
              .order('message_id', { ascending: false });
            
            if (trashError) {
              console.error("Error fetching trash messages:", trashError);
              throw trashError;
            }
            
            if (deletedMessages && deletedMessages.length > 0) {
              messages = deletedMessages.map(item => {
                const message = item.internal_messages;
                const sender = Array.isArray(message.sender) ? message.sender[0] : message.sender;
                
                return {
                  id: message.id,
                  subject: message.subject || "بدون موضوع",
                  content: message.content || "",
                  sender: {
                    id: sender?.id || "",
                    name: sender?.display_name || "غير معروف",
                    email: sender?.email,
                    avatar: null
                  },
                  recipients: [], // سيتم ملؤها لاحقاً إذا لزم الأمر
                  date: message.created_at,
                  folder: "trash",
                  read: item.read_status === 'read',
                  isStarred: message.is_starred || false,
                  labels: [],
                  attachments: message.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: '', path: '' }] : []
                };
              });
            }
            break;
          }
          
          case 'starred': {
            // الرسائل المميزة بنجمة
            // أولاً نجلب الرسائل المرسلة المميزة بنجمة
            const { data: starredSent, error: starredSentError } = await supabase
              .from('internal_messages')
              .select(`
                id,
                subject,
                content,
                created_at,
                has_attachments,
                sender:profiles!sender_id (id, display_name, email)
              `)
              .eq('sender_id', userId)
              .eq('is_starred', true)
              .order('created_at', { ascending: false });
            
            if (starredSentError) {
              console.error("Error fetching starred sent messages:", starredSentError);
              throw starredSentError;
            }
            
            // ثم نجلب الرسائل المستلمة المميزة بنجمة
            const { data: starredReceived, error: starredReceivedError } = await supabase
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
                  has_attachments,
                  sender:profiles!sender_id (id, display_name, email)
                )
              `)
              .eq('recipient_id', userId)
              .eq('is_deleted', false)
              .eq('internal_messages.is_starred', true)
              .order('message_id', { ascending: false });
            
            if (starredReceivedError) {
              console.error("Error fetching starred received messages:", starredReceivedError);
              throw starredReceivedError;
            }
            
            // دمج الرسائل المرسلة والمستلمة المميزة بنجمة
            let starredMessages = [];
            
            if (starredSent && starredSent.length > 0) {
              const sentMessages = await Promise.all(starredSent.map(async message => {
                // الحصول على المستلمين للرسالة
                const { data: recipients } = await supabase
                  .from('internal_message_recipients')
                  .select(`
                    recipient_id,
                    recipient_type,
                    profiles!recipient_id (id, display_name, email)
                  `)
                  .eq('message_id', message.id);
                
                let recipientsList = [];
                if (recipients) {
                  recipientsList = recipients.map(rec => {
                    const profile = rec.profiles;
                    return {
                      id: rec.recipient_id,
                      name: profile?.display_name || "غير معروف",
                      type: rec.recipient_type,
                      email: profile?.email || ""
                    };
                  });
                }

                const sender = Array.isArray(message.sender) ? message.sender[0] : message.sender;
                
                return {
                  id: message.id,
                  subject: message.subject || "بدون موضوع",
                  content: message.content || "",
                  sender: {
                    id: sender?.id || "",
                    name: sender?.display_name || "غير معروف",
                    email: sender?.email,
                    avatar: null
                  },
                  recipients: recipientsList,
                  date: message.created_at,
                  folder: "sent",
                  read: true,
                  isStarred: true,
                  labels: [],
                  attachments: message.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: '', path: '' }] : []
                };
              }));
              
              starredMessages = [...starredMessages, ...sentMessages];
            }
            
            if (starredReceived && starredReceived.length > 0) {
              const receivedMessages = starredReceived.map(item => {
                const message = item.internal_messages;
                const sender = Array.isArray(message.sender) ? message.sender[0] : message.sender;
                
                return {
                  id: message.id,
                  subject: message.subject || "بدون موضوع",
                  content: message.content || "",
                  sender: {
                    id: sender?.id || "",
                    name: sender?.display_name || "غير معروف",
                    email: sender?.email,
                    avatar: null
                  },
                  recipients: [], // سيتم ملؤها لاحقاً إذا لزم الأمر
                  date: message.created_at,
                  folder: "inbox",
                  read: item.read_status === 'read',
                  isStarred: true,
                  labels: [],
                  attachments: message.has_attachments ? [{ id: '1', name: 'مرفق', size: 0, type: '', path: '' }] : []
                };
              });
              
              starredMessages = [...starredMessages, ...receivedMessages];
            }
            
            // ترتيب الرسائل المميزة بنجمة حسب التاريخ (الأحدث أولاً)
            messages = starredMessages.sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            break;
          }
          
          default:
            break;
        }
        
        return messages;
      } catch (err) {
        console.error("Error fetching mailbox messages:", err);
        throw err;
      }
    },
    staleTime: 30000, // تحديث البيانات كل 30 ثانية
  });
};
