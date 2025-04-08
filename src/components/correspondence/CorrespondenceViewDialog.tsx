
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Clock, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCorrespondence, CorrespondenceAttachment, History } from "@/hooks/useCorrespondence";

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
  content?: string;
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
  const [attachments, setAttachments] = useState<CorrespondenceAttachment[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [activeTab, setActiveTab] = useState("details");
  const { getAttachments, getHistory, downloadAttachment } = useCorrespondence();
  
  useEffect(() => {
    const fetchData = async () => {
      if (mail && isOpen) {
        const attachmentsData = await getAttachments(mail.id);
        setAttachments(attachmentsData);
        
        const historyData = await getHistory(mail.id);
        setHistory(historyData);
      }
    };
    
    fetchData();
  }, [mail, isOpen, getAttachments, getHistory]);
  
  if (!mail) return null;
  
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
        <DialogHeader>
          <DialogTitle>{mail.subject}</DialogTitle>
          <div className="flex gap-2 items-center mt-2">
            <Badge className={getStatusBadge(mail.status)}>
              {mail.status}
            </Badge>
            <span className="text-sm text-muted-foreground">{mail.number}</span>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">تفاصيل المعاملة</TabsTrigger>
            <TabsTrigger value="attachments">المرفقات</TabsTrigger>
            <TabsTrigger value="history">سجل المعاملة</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">المرسل</h3>
                <p>{mail.sender}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">المستلم</h3>
                <p>{mail.recipient}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">التاريخ</h3>
                <p>{mail.date}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">نوع المعاملة</h3>
                <p>
                  {mail.type === 'incoming' ? 'وارد' : mail.type === 'outgoing' ? 'صادر' : 'خطاب'}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">محتوى المعاملة</h3>
              <div className="bg-muted/20 p-4 rounded-md mt-2 whitespace-pre-wrap">
                {mail.content || 'لا يوجد محتوى متاح'}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="attachments" className="mt-4">
            <div className="space-y-2">
              {attachments.length > 0 ? (
                attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{attachment.file_name}</span>
                      {attachment.file_size && (
                        <span className="text-xs text-muted-foreground">
                          ({Math.round(attachment.file_size / 1024)} KB)
                        </span>
                      )}
                      {attachment.is_main_document && (
                        <Badge variant="outline" className="ml-2">المستند الرئيسي</Badge>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => downloadAttachment(attachment.file_path, attachment.file_name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  لا توجد مرفقات لهذه المعاملة
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <div className="space-y-2">
              {history.length > 0 ? (
                history.map((entry) => (
                  <div key={entry.id} className="flex gap-3 p-3 bg-muted/20 rounded-md">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{entry.action_type}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.action_date || '').toLocaleString('ar-SA')}
                        </span>
                      </div>
                      {entry.action_details && (
                        <p className="text-sm mt-1">{entry.action_details}</p>
                      )}
                      {entry.previous_status && entry.new_status && (
                        <div className="mt-1 text-sm">
                          <span className="text-muted-foreground">تغيير الحالة من: </span>
                          <Badge className="mx-1 text-xs" variant="outline">{entry.previous_status}</Badge>
                          <span className="text-muted-foreground">إلى: </span>
                          <Badge className="mr-1 text-xs" variant="outline">{entry.new_status}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  لا يوجد سجل لهذه المعاملة
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
