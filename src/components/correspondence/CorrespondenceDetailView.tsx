
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  FileText, 
  Users, 
  Tag, 
  AlertTriangle, 
  Download, 
  Clock, 
  Link2
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface CorrespondenceDetailViewProps {
  correspondence: any;
  attachments: any[];
  relatedCorrespondence?: any;
  assignedToUser?: any;
  createdByUser?: any;
  onDownloadAttachment: (attachment: any) => void;
}

export const CorrespondenceDetailView: React.FC<CorrespondenceDetailViewProps> = ({
  correspondence,
  attachments,
  relatedCorrespondence,
  assignedToUser,
  createdByUser,
  onDownloadAttachment
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy', { locale: ar });
    } catch {
      return dateStr || '-';
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy - HH:mm', { locale: ar });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">{correspondence.subject}</h3>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(correspondence.date)}</span>
          </div>
          {correspondence.creation_date && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDateTime(correspondence.creation_date)}</span>
            </div>
          )}
          {correspondence.priority && (
            <div className="flex items-center gap-1">
              <Badge variant={correspondence.priority === 'عاجل' ? 'destructive' : 'outline'}>
                {correspondence.priority}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">المرسل:</span>
              <span>{correspondence.sender}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">المستلم:</span>
              <span>{correspondence.recipient}</span>
            </div>
            {createdByUser && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">منشئ المعاملة:</span>
                <span>{createdByUser.display_name}</span>
              </div>
            )}
            {assignedToUser && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">مسند إلى:</span>
                <span>{assignedToUser.display_name}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">الرقم:</span>
              <span>{correspondence.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">النوع:</span>
              <span>{correspondence.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">الحالة:</span>
              <span>{correspondence.status}</span>
            </div>
            {correspondence.priority && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">الأولوية:</span>
                <span>{correspondence.priority}</span>
              </div>
            )}
          </div>
        </div>

        {correspondence.tags && correspondence.tags.length > 0 && (
          <div className="mb-4">
            <span className="font-medium text-gray-600 ml-2 flex items-center">
              <Tag className="h-4 w-4 ml-1" />
              التصنيفات:
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {correspondence.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-blue-50">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {relatedCorrespondence && (
          <div className="mb-6 p-3 border rounded-md bg-gray-50">
            <span className="font-medium text-gray-600 mb-2 flex items-center">
              <Link2 className="h-4 w-4 ml-1" />
              معاملة مرتبطة:
            </span>
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex justify-between">
                <span>الرقم:</span>
                <span>{relatedCorrespondence.number}</span>
              </div>
              <div className="flex justify-between">
                <span>الموضوع:</span>
                <span>{relatedCorrespondence.subject}</span>
              </div>
              <div className="flex justify-between">
                <span>التاريخ:</span>
                <span>{formatDate(relatedCorrespondence.date)}</span>
              </div>
            </div>
          </div>
        )}

        {correspondence.is_confidential && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-red-700 text-sm">هذه المعاملة سرية</span>
          </div>
        )}

        {correspondence.content && (
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <FileText className="h-4 w-4 ml-1" />
              محتوى المعاملة
            </h4>
            <div className="p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">
              {correspondence.content}
            </div>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">المرفقات</h4>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div 
                  key={attachment.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 border rounded-md"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 ml-2" />
                    <div>
                      <p className="font-medium">{attachment.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.file_size / 1024).toFixed(2)} كيلوبايت
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDownloadAttachment(attachment)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
