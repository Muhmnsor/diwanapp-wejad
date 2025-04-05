
import React, { useState, useEffect } from "react";
import { MailSidebar } from "./MailSidebar";
import { MailList } from "./MailList";
import { MailView } from "./MailView";
import { ComposeDialog } from "./ComposeDialog";
import { Button } from "@/components/ui/button";
import { PenLine, Plus } from "lucide-react";

// تعريف أنواع البيانات
export interface Message {
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

// بيانات تجريبية للرسائل
const mockMessages: Message[] = [
  {
    id: "1",
    subject: "تقرير الإحصائيات الشهرية",
    sender: {
      name: "أحمد محمد",
      id: "u1",
      avatar: "/lovable-uploads/6e693a05-5355-4718-95b9-23327287d678.png"
    },
    recipients: [
      { name: "عبدالله الغامدي", id: "u2", type: 'to' }
    ],
    content: `<p>السلام عليكم ورحمة الله وبركاته</p>
      <p>مرفق لكم تقرير الإحصائيات الشهرية للإدارة العامة للشئون الإدارية والمالية. يرجى الاطلاع عليه وإبداء الملاحظات.</p>
      <p>تحياتي،<br>أحمد محمد</p>`,
    attachments: [
      {
        id: "a1",
        name: "تقرير_الإحصائيات_الشهرية.pdf",
        size: 1540000,
        type: "application/pdf",
        url: "#"
      }
    ],
    read: false,
    starred: false,
    labels: ["تقارير", "مهم"],
    date: "2025-04-01T09:00:00",
    folder: "inbox",
    hasAttachments: true
  },
  {
    id: "2",
    subject: "دعوة لحضور الاجتماع الدوري",
    sender: {
      name: "سارة العتيبي",
      id: "u3",
      avatar: ""
    },
    recipients: [
      { name: "عبدالله الغامدي", id: "u2", type: 'to' },
      { name: "محمد العمري", id: "u4", type: 'to' }
    ],
    content: `<p>السلام عليكم ورحمة الله وبركاته</p>
      <p>نود دعوتكم لحضور الاجتماع الدوري لمناقشة خطة العمل للربع القادم. سيعقد الاجتماع يوم الثلاثاء القادم الساعة العاشرة صباحاً في قاعة الاجتماعات الرئيسية.</p>
      <p>نرجو تأكيد الحضور.<br>وتقبلوا فائق التقدير،</p>
      <p>سارة العتيبي<br>مديرة الموارد البشرية</p>`,
    attachments: [],
    read: true,
    starred: true,
    labels: ["اجتماعات"],
    date: "2025-03-30T14:30:00",
    folder: "inbox",
    hasAttachments: false
  },
  {
    id: "3",
    subject: "طلب موافقة على مشروع التحول الرقمي",
    sender: {
      name: "خالد السعيد",
      id: "u5",
      avatar: ""
    },
    recipients: [
      { name: "عبدالله الغامدي", id: "u2", type: 'to' }
    ],
    content: `<p>السلام عليكم ورحمة الله وبركاته</p>
      <p>نرفق لكم مذكرة طلب الموافقة على مشروع التحول الرقمي للإدارة. المشروع يهدف إلى رفع كفاءة العمل وتسريع الإجراءات.</p>
      <p>يرجى الاطلاع على المرفقات والتوقيع على النماذج المطلوبة.</p>
      <p>مع خالص الشكر والتقدير،<br>خالد السعيد<br>مدير تقنية المعلومات</p>`,
    attachments: [
      {
        id: "a2",
        name: "مذكرة_طلب_مشروع.pdf",
        size: 2100000,
        type: "application/pdf",
        url: "#"
      },
      {
        id: "a3",
        name: "نموذج_الموافقة.docx",
        size: 550000,
        type: "application/docx",
        url: "#"
      }
    ],
    read: false,
    starred: true,
    labels: ["مشاريع", "مهم"],
    date: "2025-03-29T11:15:00",
    folder: "inbox",
    hasAttachments: true
  },
  {
    id: "4",
    subject: "رد: طلب إجازة",
    sender: {
      name: "نورة القحطاني",
      id: "u6",
      avatar: ""
    },
    recipients: [
      { name: "عبدالله الغامدي", id: "u2", type: 'to' }
    ],
    content: `<p>تم اعتماد طلب الإجازة الخاص بكم للفترة المحددة. يرجى التنسيق مع رئيس القسم قبل بدء الإجازة.</p>
      <p>مع تحياتي،<br>نورة القحطاني<br>شؤون الموظفين</p>`,
    attachments: [],
    read: true,
    starred: false,
    labels: ["إجازات"],
    date: "2025-03-28T09:45:00",
    folder: "inbox",
    hasAttachments: false
  },
  {
    id: "5",
    subject: "مسودة العرض التقديمي",
    sender: {
      name: "عبدالله الغامدي",
      id: "u2",
      avatar: ""
    },
    recipients: [
      { name: "عبدالله الغامدي", id: "u2", type: 'to' }
    ],
    content: `<p>مسودة العرض التقديمي للاجتماع القادم مع الإدارة العليا. يرجى المراجعة قبل الاجتماع.</p>`,
    attachments: [
      {
        id: "a4",
        name: "عرض_تقديمي_مسودة.pptx",
        size: 3200000,
        type: "application/pptx",
        url: "#"
      }
    ],
    read: true,
    starred: false,
    labels: [],
    date: "2025-03-27T16:20:00",
    folder: "drafts",
    hasAttachments: true
  },
  {
    id: "6",
    subject: "قاعدة البيانات الجديدة",
    sender: {
      name: "عبدالله الغامدي",
      id: "u2",
      avatar: ""
    },
    recipients: [
      { name: "محمد يوسف", id: "u7", type: 'to' },
      { name: "سلمان خان", id: "u8", type: 'cc' }
    ],
    content: `<p>محمد،</p>
      <p>هذه بيانات الدخول المؤقتة لقاعدة البيانات الجديدة. يرجى تغيير كلمة المرور فور تسجيل الدخول.</p>
      <p>تحياتي،<br>عبدالله</p>`,
    attachments: [],
    read: true,
    starred: false,
    labels: ["عمل"],
    date: "2025-03-25T10:30:00",
    folder: "sent",
    hasAttachments: false
  }
];

export const InternalMailApp: React.FC = () => {
  const [activeFolder, setActiveFolder] = useState<string>("inbox");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  // فلترة الرسائل حسب المجلد النشط
  const filteredMessages = messages.filter(msg => msg.folder === activeFolder);
  
  // حساب الإحصائيات
  const counts = {
    inbox: messages.filter(msg => msg.folder === 'inbox').length,
    unread: messages.filter(msg => msg.folder === 'inbox' && !msg.read).length,
    sent: messages.filter(msg => msg.folder === 'sent').length,
    drafts: messages.filter(msg => msg.folder === 'drafts').length,
    trash: messages.filter(msg => msg.folder === 'trash').length,
  };

  const handleSelectMessage = (message: Message) => {
    // تحديث حالة الرسالة إلى مقروءة عند اختيارها
    if (!message.read && message.folder === 'inbox') {
      const updatedMessages = messages.map(msg => 
        msg.id === message.id ? { ...msg, read: true } : msg
      );
      setMessages(updatedMessages);
      message.read = true;
    }
    setSelectedMessage(message);
  };

  const handleCloseMessage = () => {
    setSelectedMessage(null);
  };

  const handleReply = () => {
    if (selectedMessage) {
      setIsComposeOpen(true);
      // يمكن إضافة منطق الرد هنا
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden border shadow-sm">
      <div className="flex h-full">
        {/* القائمة الجانبية */}
        <div className="w-64 border-l flex-shrink-0 bg-muted/10">
          <div className="p-4">
            <Button 
              onClick={() => setIsComposeOpen(true)}
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              إنشاء رسالة جديدة
            </Button>
          </div>
          <MailSidebar 
            activeFolder={activeFolder} 
            onFolderChange={setActiveFolder} 
            counts={counts}
          />
        </div>

        {/* قائمة الرسائل وعرض الرسائل */}
        <div className="flex-1 flex">
          {!selectedMessage ? (
            <div className="w-full">
              <MailList 
                messages={filteredMessages} 
                selectedId={selectedMessage?.id} 
                onSelectMessage={handleSelectMessage}
              />
            </div>
          ) : (
            <div className="w-full">
              <MailView 
                message={selectedMessage} 
                onClose={handleCloseMessage}
                onReply={handleReply}
              />
            </div>
          )}
        </div>
      </div>

      {/* حوار إنشاء رسالة */}
      <ComposeDialog 
        isOpen={isComposeOpen} 
        onClose={() => setIsComposeOpen(false)} 
      />
    </div>
  );
};
