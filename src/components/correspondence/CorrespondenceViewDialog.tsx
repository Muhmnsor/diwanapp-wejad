
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Paperclip, Printer, Share } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttachmentsList } from "@/components/requests/detail/AttachmentsList";

interface Mail {
  id: string;
  number: string;
  subject: string;
  sender: string;
  recipient: string;
  date: string;
  status: string;
  type: string;
  hasAttachments: boolean;
}

interface CorrespondenceViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mail: Mail | null;
}

export const CorrespondenceViewDialog: React.FC<CorrespondenceViewDialogProps> = ({ 
  isOpen, 
  onClose,
  mail 
}) => {
  if (!mail) return null;
  
  // Demo attachment data
  const attachments = mail.hasAttachments ? [
    {
      id: "att1",
      filename: "خطاب_الوارد_2023.pdf",
      content_type: "application/pdf",
      file_size: 1024 * 1024 * 2.5, // 2.5MB
      created_at: new Date().toISOString(),
      uploaded_by: "مدير النظام",
      url: "#"
    },
    {
      id: "att2",
      filename: "مرفقات_إضافية.docx",
      content_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      file_size: 1024 * 512, // 512KB
      created_at: new Date().toISOString(),
      uploaded_by: "مدير النظام",
      url: "#"
    }
  ] : [];

  // Function to get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'قيد المعالجة':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'مكتمل':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'معلق':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'مرسل':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'قيد الإعداد':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'معتمد':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'مسودة':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{mail.subject}</DialogTitle>
            <Badge className={`${getStatusBadge(mail.status)} border font-medium`}>
              {mail.status}
            </Badge>
          </div>
          <DialogDescription>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span className="font-semibold">رقم المعاملة:</span>
                <span>{mail.number}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="font-semibold">التاريخ:</span>
                <span>{mail.date}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="font-semibold">المرسل:</span>
                <span>{mail.sender}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="font-semibold">المستلم:</span>
                <span>{mail.recipient}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">تفاصيل المعاملة</TabsTrigger>
              {mail.hasAttachments && <TabsTrigger value="attachments">المرفقات</TabsTrigger>}
              <TabsTrigger value="history">سجل المعاملة</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="p-4 border rounded-md">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">محتوى المعاملة</h3>
                <div className="bg-gray-50 p-4 rounded-md min-h-[200px]">
                  <p>هذا هو نص محتوى المعاملة. في النظام الفعلي، سيتم عرض النص الكامل للمعاملة هنا مع إمكانية عرض المستندات المرفقة والتعامل معها.</p>
                  <p className="mt-4">يمكن أن تشمل التفاصيل المزيد من المعلومات عن المعاملة مثل التعليمات المطلوبة، والإجراءات المتخذة، والتوجيهات من المسؤولين.</p>
                </div>
                
                {mail.type === "incoming" && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">الإجراءات المطلوبة</h3>
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p>1. توجيه المعاملة إلى إدارة المشاريع للإطلاع.</p>
                      <p>2. الرد على الجهة بما تم إنجازه.</p>
                      <p>3. حفظ صورة من الرد في ملف المعاملة.</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {mail.hasAttachments && (
              <TabsContent value="attachments" className="p-4 border rounded-md">
                <h3 className="font-semibold text-lg mb-4">مرفقات المعاملة</h3>
                <AttachmentsList attachments={attachments} />
              </TabsContent>
            )}
            
            <TabsContent value="history" className="p-4 border rounded-md">
              <h3 className="font-semibold text-lg mb-4">سجل المعاملة</h3>
              <div className="space-y-3">
                <div className="relative flex gap-4 pb-5 border-r-2 border-gray-200 pr-4">
                  <div className="absolute right-0 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-primary rounded-full w-3 h-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">تم إنشاء المعاملة</p>
                    <p className="text-xs text-muted-foreground">2025-04-01 08:30 - بواسطة: موظف الاستقبال</p>
                  </div>
                </div>
                
                <div className="relative flex gap-4 pb-5 border-r-2 border-gray-200 pr-4">
                  <div className="absolute right-0 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-primary rounded-full w-3 h-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">تم توجيه المعاملة إلى المدير العام</p>
                    <p className="text-xs text-muted-foreground">2025-04-01 09:15 - بواسطة: مدير الإدارة</p>
                  </div>
                </div>
                
                <div className="relative flex gap-4 border-r-2 border-gray-200 pr-4">
                  <div className="absolute right-0 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-primary rounded-full w-3 h-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">تم تحويل الحالة إلى قيد المعالجة</p>
                    <p className="text-xs text-muted-foreground">2025-04-03 11:45 - بواسطة: المدير العام</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex justify-between mt-6">
          <div className="flex space-x-2 space-x-reverse">
            <Button variant="outline" size="sm" onClick={onClose}>
              إغلاق
            </Button>
          </div>
          <div className="flex space-x-2 space-x-reverse">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 ml-1" />
              طباعة
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 ml-1" />
              تنزيل
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 ml-1" />
              مشاركة
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
