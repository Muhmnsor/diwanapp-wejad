
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCorrespondence, CorrespondenceAttachment } from "@/hooks/useCorrespondence";
import { Paperclip, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  mail,
}) => {
  const { getAttachments, downloadAttachment } = useCorrespondence();
  const [attachments, setAttachments] = useState<CorrespondenceAttachment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttachments = async () => {
      if (mail?.id) {
        setLoading(true);
        try {
          const attachmentsList = await getAttachments(mail.id);
          setAttachments(attachmentsList);
        } catch (error) {
          console.error("Error fetching attachments:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen && mail?.hasAttachments) {
      fetchAttachments();
    } else {
      setAttachments([]);
    }
  }, [isOpen, mail, getAttachments]);

  if (!mail) return null;

  // Get status badge class
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{mail.subject}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">رقم المعاملة</p>
              <p className="font-medium">{mail.number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">التاريخ</p>
              <p className="font-medium">{mail.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">من</p>
              <p className="font-medium">{mail.sender}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إلى</p>
              <p className="font-medium">{mail.recipient}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">الحالة</p>
            <Badge className={`mt-1 ${getStatusBadge(mail.status)} border font-medium`}>
              {mail.status}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">المحتوى</p>
            <div className="mt-1 p-4 bg-muted/30 rounded-md">
              <p className="whitespace-pre-wrap">{mail.content || 'لا يوجد محتوى'}</p>
            </div>
          </div>

          {mail.hasAttachments && (
            <div>
              <p className="text-sm text-muted-foreground">المرفقات</p>
              <div className="mt-1 space-y-2">
                {loading ? (
                  <div className="text-center py-2">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="mr-2 text-sm">جاري تحميل المرفقات...</span>
                  </div>
                ) : attachments.length > 0 ? (
                  attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
                    >
                      <div className="flex items-center">
                        <Paperclip className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span className="text-sm">{attachment.file_name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadAttachment(attachment.file_path, attachment.file_name)}
                      >
                        <Download className="h-4 w-4" />
                        <span className="ml-1">تنزيل</span>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">لا توجد مرفقات</p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
