
import React, { useState, useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { MailSidebar } from "./MailSidebar";
import { MailHeader } from "./MailHeader";
import { MailList } from "./MailList";
import { MailView } from "./MailView";
import { useMailboxMessages } from "@/hooks/mail/useMailboxMessages";
import { useMailboxCounts } from "@/hooks/mail/useMailboxCounts";
import { useMessageDetails } from "@/hooks/mail/useMessageDetails";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
}

export interface Message {
  id: string;
  subject: string;
  content: string;
  sender: {
    id: string;
    name: string;
    email?: string;
    avatar: string | null;
  };
  recipients: {
    id: string;
    name: string;
    type?: 'to' | 'cc' | 'bcc';
    email?: string;
  }[];
  date: string;
  folder?: 'inbox' | 'sent' | 'drafts' | 'trash' | 'starred';
  read: boolean;
  isStarred: boolean;
  labels: string[];
  attachments: Attachment[];
}

export const InternalMailApp: React.FC = () => {
  const [activeFolder, setActiveFolder] = useState<string>("inbox");
  const [selectedMessageId, setSelectedMessageId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [composeData, setComposeData] = useState<any>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // استخدام الـ hooks لجلب البيانات
  const { 
    data: counts = { inbox: 0, unread: 0, sent: 0, drafts: 0, trash: 0, starred: 0 }, 
    refetch: refetchCounts,
    isLoading: isLoadingCounts,
    isError: isErrorCounts,
    error: countsError
  } = useMailboxCounts();
  
  const { 
    data: messages = [], 
    isLoading: isLoadingMessages,
    isError: isErrorMessages,
    error: messagesError,
    refetch: refetchMessages 
  } = useMailboxMessages(activeFolder);
  
  const { 
    data: selectedMessage,
    isLoading: isLoadingDetails,
    refetch: refetchMessage
  } = useMessageDetails(selectedMessageId);

  // عرض رسائل الخطأ
  useEffect(() => {
    if (isErrorCounts && countsError) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء جلب عدد الرسائل. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
      console.error("Error in counts:", countsError);
    }

    if (isErrorMessages && messagesError) {
      toast({
        title: "خطأ في تحميل الرسائل",
        description: "حدث خطأ أثناء جلب الرسائل. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
      console.error("Error in messages:", messagesError);
    }
  }, [isErrorCounts, countsError, isErrorMessages, messagesError]);

  // البحث في الرسائل
  const filteredMessages = Array.isArray(messages) ? messages.filter(message => {
    if (!searchTerm) return true;
    if (!message) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      message.subject.toLowerCase().includes(searchLower) ||
      message.sender.name.toLowerCase().includes(searchLower) ||
      message.content.toLowerCase().includes(searchLower) ||
      message.recipients.some(r => r.name.toLowerCase().includes(searchLower))
    );
  }) : [];

  // تحديث البيانات عند تغيير المجلد
  useEffect(() => {
    setSelectedMessageId(undefined);
  }, [activeFolder]);

  // معالجة اختيار رسالة
  const handleSelectMessage = (message: Message) => {
    setSelectedMessageId(message.id);
  };

  // تحديث البيانات
  const handleRefresh = () => {
    refetchMessages();
    refetchCounts();
    if (selectedMessageId) {
      refetchMessage();
    }
  };

  // وظائف الإجراءات على الرسائل
  const handleStarToggle = async (messageId: string, isCurrentlyStarred: boolean) => {
    try {
      const { error } = await supabase
        .from('internal_messages')
        .update({ is_starred: !isCurrentlyStarred })
        .eq('id', messageId);
      
      if (error) throw error;
      
      // تحديث واجهة المستخدم على الفور
      if (selectedMessage) {
        selectedMessage.isStarred = !isCurrentlyStarred;
      }
      
      // تحديث القائمة والعدادات
      refetchMessages();
      refetchCounts();
      
      toast({
        title: isCurrentlyStarred ? "تم إلغاء الإضافة للمفضلة" : "تمت الإضافة للمفضلة",
        duration: 2000
      });
    } catch (error) {
      console.error("Error toggling star status:", error);
      toast({
        title: "حدث خطأ",
        description: "تعذر تحديث حالة النجمة",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMessage = async (messageId: string, currentFolder: string) => {
    try {
      // إذا كانت الرسالة في سلة المهملات، قم بحذفها نهائيًا
      if (currentFolder === 'trash') {
        const { error } = await supabase
          .from('internal_messages')
          .delete()
          .eq('id', messageId);
        
        if (error) throw error;
        
        toast({
          title: "تم حذف الرسالة نهائيًا",
          duration: 2000
        });
      } 
      // في غير ذلك، انقلها إلى سلة المهملات
      else {
        const { error } = await supabase
          .from('internal_messages')
          .update({ folder: 'trash' })
          .eq('id', messageId);
        
        if (error) throw error;
        
        toast({
          title: "تم نقل الرسالة إلى سلة المهملات",
          duration: 2000
        });
      }
      
      // إعادة تعيين الرسالة المحددة
      setSelectedMessageId(undefined);
      
      // تحديث القائمة والعدادات
      refetchMessages();
      refetchCounts();
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "حدث خطأ",
        description: "تعذر حذف الرسالة",
        variant: "destructive"
      });
    }
  };

  const handleReplyMessage = (message: Message) => {
    // تجهيز بيانات الرد
    const composeData = {
      type: 'reply',
      to: [{ id: message.sender.id, name: message.sender.name, email: message.sender.email }],
      subject: `رد: ${message.subject}`,
      content: `\n\n------------\nفي ${new Date(message.date).toLocaleString('ar')}, كتب ${message.sender.name}:\n\n${message.content}`
    };
    
    // فتح نافذة تحرير الرسالة الجديدة
    setComposeData(composeData);
    
    // إرسال حدث لفتح مكون إنشاء الرسالة
    window.dispatchEvent(new CustomEvent('compose-new-mail', { 
      detail: composeData
    }));
  };

  const handleForwardMessage = (message: Message) => {
    // تجهيز بيانات التوجيه
    const composeData = {
      type: 'forward',
      to: [],
      subject: `إعادة توجيه: ${message.subject}`,
      content: `\n\n------------\nرسالة معاد توجيهها\nمن: ${message.sender.name}\nالتاريخ: ${new Date(message.date).toLocaleString('ar')}\nالموضوع: ${message.subject}\n\n${message.content}`,
      attachments: message.attachments
    };
    
    // فتح نافذة تحرير الرسالة الجديدة
    setComposeData(composeData);
    
    // إرسال حدث لفتح مكون إنشاء الرسالة
    window.dispatchEvent(new CustomEvent('compose-new-mail', { 
      detail: composeData
    }));
  };

  const handlePrintMessage = () => {
    if (!selectedMessage) return;
    
    // فتح نافذة طباعة جديدة
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast({
        title: "تعذر فتح نافذة الطباعة",
        description: "تأكد من السماح بالنوافذ المنبثقة",
        variant: "destructive"
      });
      return;
    }
    
    // بناء HTML للطباعة
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>${selectedMessage.subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            direction: rtl;
          }
          .header {
            border-bottom: 1px solid #ddd;
            padding-bottom: 15px;
            margin-bottom: 15px;
          }
          .subject {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .meta {
            color: #666;
            margin-bottom: 5px;
          }
          .content {
            line-height: 1.6;
          }
          .attachments {
            border-top: 1px solid #ddd;
            margin-top: 20px;
            padding-top: 10px;
          }
          .attachment {
            background: #f5f5f5;
            padding: 5px;
            margin: 5px 0;
            border-radius: 3px;
            display: inline-block;
            margin-left: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="subject">${selectedMessage.subject}</div>
          <div class="meta">من: ${selectedMessage.sender.name}${selectedMessage.sender.email ? ` <${selectedMessage.sender.email}>` : ''}</div>
          <div class="meta">إلى: ${selectedMessage.recipients.filter(r => r.type === 'to' || !r.type).map(r => r.name).join(', ')}</div>
          ${selectedMessage.recipients.filter(r => r.type === 'cc').length > 0 ? 
            `<div class="meta">نسخة: ${selectedMessage.recipients.filter(r => r.type === 'cc').map(r => r.name).join(', ')}</div>` : ''}
          <div class="meta">التاريخ: ${new Date(selectedMessage.date).toLocaleString('ar')}</div>
        </div>
        <div class="content">${selectedMessage.content.replace(/\n/g, '<br>')}</div>
        ${selectedMessage.attachments.length > 0 ? `
          <div class="attachments">
            <strong>المرفقات:</strong>
            ${selectedMessage.attachments.map(att => `<div class="attachment">${att.name} (${Math.round(att.size/1024)} KB)</div>`).join('')}
          </div>
        ` : ''}
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // تشغيل الطباعة بعد تحميل المستند
    setTimeout(() => {
      printWindow.print();
      // إغلاق النافذة بعد الطباعة (اختياري)
      // printWindow.close();
    }, 500);
  };

  useEffect(() => {
    console.log("Active folder:", activeFolder);
    console.log("Messages:", messages);
    console.log("Counts:", counts);
  }, [activeFolder, messages, counts]);

  return (
    <div className="flex flex-col h-full">
      <MailHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isSearching={isSearching}
        onRefresh={handleRefresh}
      />
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
          <MailSidebar 
            activeFolder={activeFolder} 
            onFolderChange={setActiveFolder}
            counts={counts}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <MailList 
            messages={filteredMessages} 
            selectedId={selectedMessageId}
            onSelectMessage={handleSelectMessage}
            isLoading={isLoadingMessages}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50}>
          <MailView 
            message={selectedMessage} 
            isLoading={isLoadingDetails || !selectedMessageId}
            onBack={() => setSelectedMessageId(undefined)}
            folder={activeFolder}
            onStarToggle={handleStarToggle}
            onDelete={handleDeleteMessage}
            onReply={handleReplyMessage}
            onForward={handleForwardMessage}
            onPrint={handlePrintMessage}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
