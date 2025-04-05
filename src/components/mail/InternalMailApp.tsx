
import React, { useState } from "react";
import { MailSidebar } from "./MailSidebar";
import { MailList } from "./MailList";
import { MailView } from "./MailView";
import { ComposeMailDialog } from "./ComposeMailDialog";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";

interface Message {
  id: string;
  subject: string;
  sender: {
    name: string;
    id: string;
    avatar?: string;
  };
  recipients: {
    name: string;
    id: string;
    type: 'to' | 'cc' | 'bcc';
  }[];
  content: string;
  attachments: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
  read: boolean;
  starred: boolean;
  labels: string[];
  date: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
  hasAttachments: boolean;
}

export const InternalMailApp = () => {
  const [activeFolder, setActiveFolder] = useState<string>("inbox");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  // تمثيل البيانات للعرض - في المشروع الحقيقي ستأتي من قاعدة البيانات
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      subject: "مرحباً بك في نظام البريد الداخلي",
      sender: {
        name: "أحمد محمد",
        id: "user1",
        avatar: "",
      },
      recipients: [
        {
          name: "أنت",
          id: "current-user",
          type: "to"
        }
      ],
      content: `<p>مرحباً بك في نظام البريد الداخلي الجديد!</p>
                <p>هذا النظام يتيح لك التواصل مع زملاءك في العمل بسهولة وسرعة.</p>
                <p>يمكنك إرسال واستقبال الرسائل وإرفاق الملفات وتنظيم بريدك في مجلدات.</p>
                <p>نتمنى لك تجربة ممتعة!</p>`,
      attachments: [],
      read: false,
      starred: false,
      labels: ["عام"],
      date: new Date().toISOString(),
      folder: "inbox",
      hasAttachments: false
    },
    {
      id: "2",
      subject: "اجتماع قسم التطوير - الخميس القادم",
      sender: {
        name: "سارة الأحمد",
        id: "user2",
        avatar: "",
      },
      recipients: [
        {
          name: "فريق التطوير",
          id: "team-dev",
          type: "to"
        }
      ],
      content: `<p>السلام عليكم،</p>
                <p>أود تذكيركم باجتماعنا القادم يوم الخميس الساعة 10:00 صباحاً.</p>
                <p>سنناقش خطة العمل للربع القادم وتوزيع المهام الجديدة.</p>
                <p>مرفق جدول الأعمال.</p>
                <p>تحياتي،</p>
                <p>سارة</p>`,
      attachments: [
        {
          id: "att1",
          name: "جدول_الأعمال.pdf",
          size: 245000,
          type: "application/pdf",
          url: "#"
        }
      ],
      read: true,
      starred: true,
      labels: ["عمل", "مهم"],
      date: new Date(Date.now() - 86400000).toISOString(), // بالأمس
      folder: "inbox",
      hasAttachments: true
    },
    {
      id: "3",
      subject: "تقرير شهر مارس",
      sender: {
        name: "أنت",
        id: "current-user",
        avatar: "",
      },
      recipients: [
        {
          name: "محمد العبدالله",
          id: "user3",
          type: "to"
        }
      ],
      content: `<p>مرفق التقرير الشهري لشهر مارس.</p>
                <p>برجاء مراجعته وإبداء ملاحظاتك.</p>
                <p>شكراً</p>`,
      attachments: [
        {
          id: "att2",
          name: "تقرير_مارس.xlsx",
          size: 1200000,
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          url: "#"
        }
      ],
      read: true,
      starred: false,
      labels: ["تقارير"],
      date: new Date(Date.now() - 172800000).toISOString(), // قبل يومين
      folder: "sent",
      hasAttachments: true
    }
  ]);

  // وظيفة إرسال بريد جديد
  const handleSendMail = (newMail: any) => {
    // في التطبيق الحقيقي نرسل للخادم
    console.log("Sending mail:", newMail);
    setComposeOpen(false);
    // إضافة الرسالة المرسلة إلى قائمة الرسائل المرسلة
    const sentMail: Message = {
      id: `new-${Date.now()}`,
      subject: newMail.subject,
      sender: {
        name: "أنت",
        id: "current-user",
        avatar: "",
      },
      recipients: newMail.to.map((recipient: string) => ({
        name: recipient,
        id: `recipient-${Date.now()}`,
        type: 'to' as const
      })),
      content: newMail.content,
      attachments: newMail.attachments || [],
      read: true,
      starred: false,
      labels: [],
      date: new Date().toISOString(),
      folder: 'sent',
      hasAttachments: (newMail.attachments && newMail.attachments.length > 0) || false
    };
    setMessages([...messages, sentMail]);
  };

  // تصفية الرسائل حسب المجلد النشط
  const filteredMessages = messages.filter(msg => msg.folder === activeFolder);

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">البريد الداخلي</h1>
        <Button 
          onClick={() => setComposeOpen(true)} 
          className="flex items-center gap-2"
        >
          <PenSquare className="h-4 w-4" />
          إنشاء رسالة جديدة
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden h-[calc(100vh-230px)]">
        <div className="grid grid-cols-12 h-full">
          <div className="col-span-2 border-l">
            <MailSidebar 
              activeFolder={activeFolder} 
              onFolderChange={setActiveFolder} 
              counts={{
                inbox: messages.filter(msg => msg.folder === 'inbox').length,
                unread: messages.filter(msg => msg.folder === 'inbox' && !msg.read).length,
                sent: messages.filter(msg => msg.folder === 'sent').length,
                drafts: messages.filter(msg => msg.folder === 'drafts').length,
                trash: messages.filter(msg => msg.folder === 'trash').length,
              }}
            />
          </div>
          
          <div className={`${selectedMessage ? 'col-span-3' : 'col-span-10'} border-l overflow-auto`}>
            <MailList 
              messages={filteredMessages}
              selectedId={selectedMessage?.id}
              onSelectMessage={(message) => setSelectedMessage(message)}
            />
          </div>
          
          {selectedMessage && (
            <div className="col-span-7 overflow-auto">
              <MailView 
                message={selectedMessage} 
                onClose={() => setSelectedMessage(null)}
                onReply={() => setComposeOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      <ComposeMailDialog 
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSend={handleSendMail}
        replyTo={selectedMessage}
      />
    </div>
  );
};
