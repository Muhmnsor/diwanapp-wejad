
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
    isLoading: isLoadingDetails
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
  const filteredMessages = messages.filter(message => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      message.subject.toLowerCase().includes(searchLower) ||
      message.sender.name.toLowerCase().includes(searchLower) ||
      message.content.toLowerCase().includes(searchLower) ||
      message.recipients.some(r => r.name.toLowerCase().includes(searchLower))
    );
  });

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
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
