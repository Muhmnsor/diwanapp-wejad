
import React, { useState, useEffect } from "react";
import { MailSidebar } from "./MailSidebar";
import { MailList } from "./MailList";
import { MailView } from "./MailView";
import { ComposeDialog } from "./ComposeDialog";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Message {
  id: string;
  subject: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  date: string;
  read: boolean;
  folder: string;
  attachments: {
    id: string;
    name: string;
    size: number;
    type: string;
  }[];
  recipients: {
    id: string;
    name: string;
    type: string;
  }[];
  labels: string[];
}

export const InternalMailApp: React.FC = () => {
  const [folder, setFolder] = useState<string>("inbox");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [counts, setCounts] = useState({
    inbox: 0,
    unread: 0,
    sent: 0,
    drafts: 0,
    trash: 0,
  });
  
  const queryClient = useQueryClient();

  // جلب الرسائل حسب المجلد
  const fetchMessages = async (folderName: string) => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error("يجب تسجيل الدخول لعرض الرسائل");
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .rpc('get_user_messages', {
          p_user_id: user.user.id,
          p_folder: folderName
        });
      
      if (error) throw error;
      
      // تحويل البيانات إلى التنسيق المطلوب
      const formattedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        subject: msg.subject,
        content: msg.content,
        sender: {
          id: msg.sender_id,
          name: msg.sender_name || "مستخدم",
          email: "", // يمكن إضافته لاحقًا إذا كان مطلوبًا
        },
        date: new Date(msg.created_at).toISOString(),
        read: msg.is_read,
        folder: folderName,
        attachments: [], // سيتم جلبها لاحقًا عند تحديد رسالة
        recipients: msg.recipients || [],
        labels: [],
      }));
      
      setMessages(formattedMessages);
      
      // تحديث الإحصائيات
      await fetchCounts(user.user.id);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("حدث خطأ في جلب الرسائل");
    } finally {
      setIsLoading(false);
    }
  };
  
  // جلب إحصائيات الرسائل
  const fetchCounts = async (userId: string) => {
    try {
      // جلب عدد الرسائل في البريد الوارد والغير مقروءة
      const { data: inboxData } = await supabase
        .from('internal_message_recipients')
        .select('id, read_status')
        .eq('recipient_id', userId)
        .eq('is_deleted', false);
        
      const inboxCount = inboxData?.length || 0;
      const unreadCount = inboxData?.filter(msg => msg.read_status === 'unread')?.length || 0;
      
      // جلب عدد الرسائل المرسلة
      const { count: sentCount } = await supabase
        .from('internal_messages')
        .select('id', { count: 'exact' })
        .eq('sender_id', userId)
        .eq('is_draft', false);
      
      // جلب عدد المسودات
      const { count: draftsCount } = await supabase
        .from('internal_messages')
        .select('id', { count: 'exact' })
        .eq('sender_id', userId)
        .eq('is_draft', true);
      
      // جلب عدد الرسائل المحذوفة
      const { count: trashCount } = await supabase
        .from('internal_message_recipients')
        .select('id', { count: 'exact' })
        .eq('recipient_id', userId)
        .eq('is_deleted', true);
      
      setCounts({
        inbox: inboxCount,
        unread: unreadCount,
        sent: sentCount || 0,
        drafts: draftsCount || 0,
        trash: trashCount || 0,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };
  
  // جلب تفاصيل رسالة محددة
  const fetchMessageDetails = async (messageId: string) => {
    try {
      // جلب معلومات المرفقات
      const { data: attachments } = await supabase
        .from('internal_message_attachments')
        .select('*')
        .eq('message_id', messageId);
      
      // تحديث حالة الرسالة إلى مقروءة
      if (folder === "inbox") {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          await supabase
            .from('internal_message_recipients')
            .update({ read_status: 'read', read_at: new Date().toISOString() })
            .eq('message_id', messageId)
            .eq('recipient_id', user.user.id);
            
          // تحديث القائمة لتعكس أن الرسالة مقروءة
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === messageId ? { ...msg, read: true } : msg
            )
          );
          
          // تحديث العدادات
          await fetchCounts(user.user.id);
        }
      }
      
      // إضافة المرفقات إلى الرسالة المحددة
      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({
          ...selectedMessage,
          attachments: attachments ? attachments.map(att => ({
            id: att.id,
            name: att.file_name,
            size: att.file_size || 0,
            type: att.file_type || ""
          })) : [],
          read: true
        });
      }
    } catch (error) {
      console.error("Error fetching message details:", error);
    }
  };

  // تغيير المجلد الحالي
  const handleFolderChange = (newFolder: string) => {
    setFolder(newFolder);
    setSelectedMessage(null);
  };

  // تحديد رسالة
  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    fetchMessageDetails(message.id);
  };

  // إغلاق عرض الرسالة
  const handleCloseMessage = () => {
    setSelectedMessage(null);
  };

  // فتح نافذة الرد
  const handleReply = () => {
    if (!selectedMessage) return;
    
    // هنا يمكننا تهيئة بيانات الرد
    setIsComposeOpen(true);
    // إضافة المنطق الخاص بالرد لاحقًا
  };

  useEffect(() => {
    fetchMessages(folder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  return (
    <div className="flex h-full divide-x rtl:divide-x-reverse border-t">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 overflow-hidden">
        <MailSidebar 
          activeFolder={folder} 
          onFolderChange={handleFolderChange} 
          counts={counts}
        />
      </div>

      {/* Message List or Message View */}
      <div className="flex-1 flex overflow-hidden">
        {!selectedMessage ? (
          <div className="flex-1 overflow-hidden">
            <MailList 
              messages={messages} 
              selectedId={selectedMessage?.id}
              onSelectMessage={handleSelectMessage} 
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <MailView 
              message={selectedMessage} 
              onClose={handleCloseMessage}
              onReply={handleReply}
            />
          </div>
        )}
      </div>

      {/* Compose Dialog */}
      <ComposeDialog
        isOpen={isComposeOpen}
        onClose={() => {
          setIsComposeOpen(false);
          // إعادة تحميل الرسائل بعد الإغلاق
          fetchMessages(folder);
        }}
      />
    </div>
  );
};
