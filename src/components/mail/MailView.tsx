
import React from "react";
import { Message } from "./InternalMailApp";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, StarOff, Trash2, Reply, Forward, Printer } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface MailViewProps {
  message?: Message;
  isLoading: boolean;
  onBack: () => void;
  folder: string;
  onStarToggle: (messageId: string, isCurrentlyStarred: boolean) => void;
  onDelete: (messageId: string, currentFolder: string) => void;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onPrint: () => void;
}

export const MailView: React.FC<MailViewProps> = ({
  message,
  isLoading,
  onBack,
  folder,
  onStarToggle,
  onDelete,
  onReply,
  onForward,
  onPrint
}) => {
  // إذا كان جاري التحميل أو لا توجد رسالة محددة
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-6">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="ml-2" size={16} />
            العودة
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل الرسالة...</p>
          </div>
        </div>
      </div>
    );
  }

  // إذا لم تكن هناك رسالة محددة
  if (!message) {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-6">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg text-gray-500">اختر رسالة لعرضها</p>
          </div>
        </div>
      </div>
    );
  }

  // تنسيق التاريخ
  const formattedDate = format(new Date(message.date), "d MMMM yyyy, HH:mm", { locale: ar });

  return (
    <div className="flex flex-col h-full bg-white" dir="rtl">
      {/* رأس الرسالة مع أزرار العمليات */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex justify-between items-center mb-2">
          <Button variant="ghost" onClick={onBack} size="sm" className="ml-2">
            <ArrowLeft className="ml-1" size={16} />
            العودة
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStarToggle(message.id, message.isStarred)}
              title={message.isStarred ? "إلغاء الإضافة للمفضلة" : "إضافة للمفضلة"}
            >
              {message.isStarred ? <StarOff size={16} /> : <Star size={16} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(message.id, folder)}
              title={folder === "trash" ? "حذف نهائي" : "نقل إلى المهملات"}
            >
              <Trash2 size={16} className={folder === "trash" ? "text-red-600" : ""} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(message)}
              title="رد"
            >
              <Reply size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onForward(message)}
              title="إعادة توجيه"
            >
              <Forward size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrint}
              title="طباعة"
            >
              <Printer size={16} />
            </Button>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">{message.subject}</h2>
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {message.sender.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">
                  {message.sender.name}
                  {message.sender.email && (
                    <span className="text-muted-foreground mr-2 font-normal">
                      &lt;{message.sender.email}&gt;
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  إلى:{" "}
                  {message.recipients
                    .filter(r => r.type === "to" || !r.type)
                    .map(r => r.name)
                    .join(", ")}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">{formattedDate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* محتوى الرسالة */}
      <div className="flex-1 overflow-auto p-4">
        <div className="whitespace-pre-wrap mb-6">{message.content}</div>

        {/* قسم المرفقات */}
        {message.attachments.length > 0 && (
          <div className="mt-6">
            <Separator className="mb-4" />
            <h3 className="text-sm font-medium mb-2">المرفقات ({message.attachments.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="bg-gray-50 border rounded-md p-2 flex items-center"
                >
                  <div className="bg-gray-100 p-2 rounded mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(attachment.size / 1024)} كيلوبايت
                    </p>
                  </div>
                  <a
                    href={attachment.path}
                    download
                    className="text-xs text-primary hover:underline ml-2 whitespace-nowrap"
                  >
                    تحميل
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* التصنيفات */}
        {message.labels.length > 0 && (
          <div className="mt-6">
            <Separator className="mb-4" />
            <div className="flex flex-wrap gap-2">
              {message.labels.map((label, index) => (
                <Badge key={index} variant="outline">
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
