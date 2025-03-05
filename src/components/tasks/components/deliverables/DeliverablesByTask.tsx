
import { FileIcon, Download, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useTaskDeliverables, TaskDeliverable } from "../../hooks/useTaskDeliverables";

interface DeliverablesByTaskProps {
  taskId: string;
  deliverables: TaskDeliverable[];
  onDownload: (fileUrl: string, fileName: string) => void;
  onDelete?: (deliverableId: string) => Promise<boolean>;
  isDeleting?: Record<string, boolean>;
  canDelete?: boolean;
  canApprove?: boolean;
  onRefresh?: () => void;
}

export const DeliverablesByTask = ({
  taskId,
  deliverables,
  onDownload,
  onDelete,
  isDeleting = {},
  canDelete = false,
  canApprove = false,
  onRefresh
}: DeliverablesByTaskProps) => {
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const { provideFeedback } = useTaskDeliverables(onRefresh, onRefresh);
  
  if (deliverables.length === 0) return (
    <div className="p-4 text-center text-gray-500">
      لا توجد مستلمات مرفوعة لهذه المهمة
    </div>
  );
  
  const handleApproveDeny = async (deliverableId: string, status: 'approved' | 'rejected') => {
    const feedback = feedbackText[deliverableId] || (status === 'approved' ? 'تم قبول المستلمات' : 'تم رفض المستلمات');
    await provideFeedback(deliverableId, feedback, status);
    if (onRefresh) onRefresh();
    setShowFeedback(prev => ({...prev, [deliverableId]: false}));
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">مقبول</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">مرفوض</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">قيد المراجعة</Badge>;
    }
  };
  
  return (
    <div className="w-full mt-2 space-y-3">
      <div className="text-sm font-medium mb-1">المستلمات</div>
      <div className="space-y-2">
        {deliverables.map((deliverable) => (
          <div key={deliverable.id} className="border rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <FileIcon className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                <span className="flex-1 truncate font-medium">{deliverable.file_name}</span>
              </div>
              {getStatusBadge(deliverable.status)}
            </div>
            
            {deliverable.feedback && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm">
                <p className="font-medium">ملاحظات:</p>
                <p className="text-gray-600">{deliverable.feedback}</p>
              </div>
            )}
            
            {showFeedback[deliverable.id] && (
              <div className="mt-2 space-y-2">
                <Textarea 
                  placeholder="أدخل ملاحظاتك هنا..."
                  value={feedbackText[deliverable.id] || ''}
                  onChange={(e) => setFeedbackText(prev => ({...prev, [deliverable.id]: e.target.value}))}
                  className="text-sm"
                />
                <div className="flex gap-2 justify-end">
                  <Button 
                    size="sm"
                    variant="outline" 
                    onClick={() => setShowFeedback(prev => ({...prev, [deliverable.id]: false}))}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    size="sm"
                    variant="destructive" 
                    onClick={() => handleApproveDeny(deliverable.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    رفض
                  </Button>
                  <Button 
                    size="sm"
                    variant="default" 
                    onClick={() => handleApproveDeny(deliverable.id, 'approved')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    قبول
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-end gap-2 mt-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onDownload(deliverable.file_url, deliverable.file_name)}
                title="تنزيل الملف"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              {canDelete && onDelete && deliverable.status === 'pending' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive"
                  onClick={() => onDelete(deliverable.id)}
                  disabled={isDeleting[deliverable.id]}
                  title="حذف الملف"
                >
                  {isDeleting[deliverable.id] ? (
                    <span className="h-4 w-4 animate-spin">⏳</span>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              {canApprove && deliverable.status === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFeedback(prev => ({...prev, [deliverable.id]: !prev[deliverable.id]}))}
                >
                  {showFeedback[deliverable.id] ? 'إلغاء' : 'إضافة ملاحظات'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
