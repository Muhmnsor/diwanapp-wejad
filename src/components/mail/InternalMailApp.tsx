
import React, { useState, useEffect } from "react";
import { MailSidebar } from "@/components/mail/MailSidebar";
import { MailList } from "@/components/mail/MailList";
import { MailView } from "@/components/mail/MailView";
import { MailHeader } from "@/components/mail/MailHeader";
import { useMailboxMessages, MailFolder } from "@/hooks/mail/useMailboxMessages";
import { useMessageOperations } from "@/hooks/mail/useMessageOperations";
import { useMessageDetails } from "@/hooks/mail/useMessageDetails";
import { useMailSearch } from "@/hooks/mail/useMailSearch";

export interface MessageRecipient {
  id: string;
  name: string;
  type: "to" | "cc" | "bcc";
  email?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  path?: string;
}

export interface Message {
  id: string;
  subject: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  recipients: MessageRecipient[];
  date: string;
  folder: string;
  read: boolean;
  isStarred: boolean;
  labels: string[];
  attachments: MessageAttachment[];
}

export const InternalMailApp = () => {
  const [activeFolder, setActiveFolder] = useState<MailFolder>('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  
  const { 
    data: messages = [], 
    isLoading: isLoadingMessages, 
    refetch: refetchMessages,
    isRefetching: isRefetchingMessages
  } = useMailboxMessages(activeFolder);
  
  const {
    data: selectedMessage,
    isLoading: isLoadingMessageDetails
  } = useMessageDetails(selectedMessageId || undefined);
  
  const {
    markAsRead,
    toggleStar,
    deleteMessage
  } = useMessageOperations();
  
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching
  } = useMailSearch(activeFolder);
  
  // تحديد الرسائل التي سيتم عرضها بناءً على وضع البحث
  const displayedMessages = searchMode && searchTerm
    ? searchResults
    : messages;
  
  // عدد الرسائل غير المقروءة
  const unreadCount = messages.filter(m => !m.read).length;
  
  // حساب عدد الرسائل في كل مجلد
  const counts = {
    inbox: messages.length,
    unread: unreadCount,
    sent: 0, // سيتم تحديثها عند فتح المجلد
    drafts: 0, // سيتم تحديثها عند فتح المجلد
    trash: 0, // سيتم تحديثها عند فتح المجلد
  };
  
  // التعامل مع تغيير المجلد
  const handleFolderChange = (folder: string) => {
    setActiveFolder(folder as MailFolder);
    setSelectedMessageId(null);
    setSearchMode(false);
    setSearchTerm("");
  };
  
  // التعامل مع اختيار رسالة
  const handleSelectMessage = (message: Message) => {
    setSelectedMessageId(message.id);
    
    // تحديث حالة القراءة إذا لم تكن الرسالة مقروءة بالفعل
    if (!message.read) {
      markAsRead.mutate({ messageId: message.id, read: true });
    }
  };
  
  // التعامل مع الرد على رسالة
  const handleReply = () => {
    if (selectedMessage) {
      window.dispatchEvent(new CustomEvent('compose-new-mail', { 
        detail: { 
          type: 'reply', 
          message: selectedMessage 
        } 
      }));
    }
  };
  
  // التعامل مع حذف رسالة
  const handleDelete = () => {
    if (selectedMessageId) {
      deleteMessage.mutate({ 
        messageId: selectedMessageId, 
        folder: activeFolder 
      }, {
        onSuccess: () => {
          setSelectedMessageId(null);
        }
      });
    }
  };
  
  // إعادة تعيين الرسالة المحددة عند تغيير المجلد
  useEffect(() => {
    setSelectedMessageId(null);
  }, [activeFolder]);
  
  // تفعيل البحث عندما يكون هناك مصطلح بحث
  useEffect(() => {
    if (searchTerm) {
      setSearchMode(true);
    } else {
      setSearchMode(false);
    }
  }, [searchTerm]);
  
  return (
    <div className="h-full flex flex-col">
      <MailHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isSearching={isSearching}
        onRefresh={() => refetchMessages()}
      />
      
      <div className="flex-1 overflow-hidden flex">
        <div className="w-64 border-l h-full overflow-auto">
          <MailSidebar 
            activeFolder={activeFolder} 
            onFolderChange={handleFolderChange} 
            counts={counts} 
          />
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <div className={`w-1/3 border-l h-full ${selectedMessageId ? 'hidden md:block' : 'w-full'}`}>
            <MailList 
              messages={displayedMessages}
              selectedId={selectedMessageId || undefined}
              onSelectMessage={handleSelectMessage}
              isLoading={isLoadingMessages || isRefetchingMessages}
            />
          </div>
          
          <div className={`flex-1 h-full ${!selectedMessageId ? 'hidden md:hidden' : 'w-2/3'}`}>
            {selectedMessageId && selectedMessage ? (
              <MailView 
                message={selectedMessage}
                onClose={() => setSelectedMessageId(null)}
                onReply={handleReply}
                onDelete={handleDelete}
                onStar={() => toggleStar.mutate({ 
                  messageId: selectedMessageId, 
                  isStarred: !selectedMessage.isStarred 
                })}
                isLoading={isLoadingMessageDetails}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {selectedMessageId && !selectedMessage ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>جاري تحميل الرسالة...</p>
                  </div>
                ) : (
                  <p>اختر رسالة لعرضها</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
