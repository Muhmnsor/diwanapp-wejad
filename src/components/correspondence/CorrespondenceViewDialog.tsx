
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Paperclip } from "lucide-react";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Attachment, Correspondence } from '@/hooks/correspondence/useCorrespondence';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CorrespondenceViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  correspondence: Correspondence | null;
  onDownload: (attachment: Attachment) => void;
}

export const CorrespondenceViewDialog: React.FC<CorrespondenceViewDialogProps> = ({
  isOpen,
  onClose,
  correspondence,
  onDownload
}) => {
  if (!correspondence) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP', { locale: ar });
    } catch {
      return dateString;
    }
  };

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
      <DialogContent dir="rtl" className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{correspondence.subject}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-500">رقم المعاملة</div>
            <div className="font-medium">{correspondence.number}</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-500">التاريخ</div>
            <div className="font-medium">{formatDate(correspondence.date)}</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-500">المرسل</div>
            <div className="font-medium">{correspondence.sender}</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-500">المستلم</div>
            <div className="font-medium">{correspondence.recipient}</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-500">النوع</div>
            <div className="font-medium">{correspondence.type}</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-500">الحالة</div>
            <div>
              <Badge className={`${getStatusBadge(correspondence.status)} border font-medium`}>
                {correspondence.status}
              </Badge>
            </div>
          </div>

          {correspondence.priority && (
            <div className="space-y-2">
              <div className="text-sm text-gray-500">الأولوية</div>
              <div className="font-medium">{correspondence.priority}</div>
            </div>
          )}

          {correspondence.is_confidential && (
            <div className="space-y-2">
              <div className="text-sm text-gray-500">سرية المعاملة</div>
              <Badge variant="destructive">سري</Badge>
            </div>
          )}
        </div>

        {correspondence.content && (
          <div className="space-y-2 border-t pt-4">
            <div className="text-sm text-gray-500 font-medium">المحتوى</div>
            <ScrollArea className="h-48 rounded-md border p-4">
              <div className="whitespace-pre-wrap">{correspondence.content}</div>
            </ScrollArea>
          </div>
        )}

        {correspondence.hasAttachments && correspondence.attachments && correspondence.attachments.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <div className="text-sm text-gray-500 font-medium">المرفقات</div>
            <div className="rounded-md border">
              <div className="divide-y">
                {correspondence.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{attachment.file_name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDownload(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
