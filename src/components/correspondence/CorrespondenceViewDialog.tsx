// src/components/correspondence/CorrespondenceViewDialog.tsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Download, Eye, FileText, Users, Clock, MessageSquare } from "lucide-react";
import { Correspondence, CorrespondenceAttachment, useAttachments } from "@/hooks/useCorrespondence";
import { supabase } from "@/integrations/supabase/client";

interface CorrespondenceViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mail: Correspondence | null;
}

export const CorrespondenceViewDialog: React.FC<CorrespondenceViewDialogProps> = ({ 
  isOpen, 
  onClose, 
  mail 
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [attachments, setAttachments] = useState<CorrespondenceAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [distributions, setDistributions] = useState<any[]>([]);
  
  const { downloadAttachment, getAttachmentUrl } = useAttachments();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<CorrespondenceAttachment | null>(null);

  useEffect(() => {
    if (mail && isOpen) {
      fetchAttachments();
      fetchHistory();
      fetchDistributions();
    }
  }, [mail, isOpen]);

  const fetchAttachments = async () => {
    if (!mail) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('correspondence_attachments')
        .select('*')
        .eq('correspondence_id', mail.id);
        
      if (error) {
        console.error('Error fetching attachments:', error);
        return;
      }
      
      setAttachments(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchHistory = async () => {
    if (!mail) return;
    
    try {
      const { data, error } = await supabase
        .from('correspondence_history')
        .select('*')
        .eq('correspondence_id', mail.id)
        .order('action_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching history:', error);
        return;
      }
      
      setHistory(data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  const fetchDistributions = async () => {
    if (!mail) return;
    
    try {
      const { data, error } = await supabase
        .from('correspondence_distribution')
        .select('*')
        .eq('correspondence_id', mail.id);
        
      if (error) {
        console.error('Error fetching distributions:', error);
        return;
      }
      
      setDistributions(data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  const handleViewAttachment = async (attachment: CorrespondenceAttachment) => {
    setSelectedAttachment(attachment);
    const result = await getAttachmentUrl(attachment.file_path);
    if (result.success) {
      setPreviewUrl(result.url);
    }
  };
  
  const handleDownloadAttachment = async (attachment: CorrespondenceAttachment) => {
    await downloadAttachment(attachment.file_path, attachment.file_name);
  };
  
  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
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
  
  if (!mail) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>معاملة رقم: {mail.number}</span>
            <Badge className={`${getStatusBadge(mail.status)} border font-medium`}>
              {mail.status}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-lg font-bold">{mail.subject}</DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>تفاصيل المعاملة</span>
            </TabsTrigger>
            <TabsTrigger value="attachments" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>المرفقات ({attachments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>سجل الإجراءات</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>التوزيع</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="flex-1 overflow-auto mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">المرسل</h4>
                <p className="text-lg">{mail.sender}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">المستلم</h4>
                <p className="text-lg">{mail.recipient}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">التاريخ</h4>
                <p className="text-lg">{getFormattedDate(mail.date)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">الأولوية</h4>
                <p className="text-lg">{mail.priority || 'عادية'}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">محتوى المعاملة</h4>
              <div className="p-4 border rounded-md bg-muted/30 whitespace-pre-wrap">
                {mail.content || 'لا يوجد محتوى مسجل للمعاملة'}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="attachments" className="flex-1 overflow-hidden mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="overflow-auto border rounded-md">
              <div className="p-3 bg-muted font-medium">المرفقات</div>
              {loading ? (
                <div className="p-4 text-center">جاري تحميل المرفقات...</div>
              ) : attachments.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">لا توجد مرفقات</div>
              ) : (
                <ul className="divide-y">
                  {attachments.map((attachment) => (
                    <li key={attachment.id} className="p-3 hover:bg-muted/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{attachment.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.file_size)} • 
                            {attachment.is_main_document && <span className="text-primary mr-1">مستند رئيسي</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewAttachment(attachment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadAttachment(attachment)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="border rounded-md overflow-hidden flex flex-col">
              <div className="p-3 bg-muted font-medium">
                {selectedAttachment ? (
                  <div className="flex justify-between items-center">
                    <span>معاينة: {selectedAttachment.file_name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadAttachment(selectedAttachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span>معاينة المرفق</span>
                )}
              </div>
              
              <div className="flex-1 bg-muted/10 flex items-center justify-center">
                {previewUrl ? (
                  <iframe 
                    src={previewUrl} 
                    className="w-full h-full" 
                    title="File preview" 
                  />
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>اختر ملفاً للمعاينة</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="flex-1 overflow-auto mt-4">
            {history.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>لا يوجد سجل للإجراءات</p>
              </div>
            ) : (
              <ul className="divide-y">
                {history.map((item) => (
                  <li key={item.id} className="py-3 border-b last:border-0">
                    <div className="flex justify-between">
                      <div className="font-medium">{item.action_type}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(item.action_date).toLocaleString('ar-SA')}
                      </div>
                    </div>
                    {item.action_details && (
                      <p className="mt-1 text-sm">{item.action_details}</p>
                    )}
                    {item.previous_status && item.new_status && (
                      <div className="mt-1 flex gap-2 text-sm">
                        <span>تغيير الحالة من:</span>
                        <Badge className={getStatusBadge(item.previous_status)}>
                          {item.previous_status}
                        </Badge>
                        <span>إلى:</span>
                        <Badge className={getStatusBadge(item.new_status)}>
                          {item.new_status}
                        </Badge>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
          
          <TabsContent value="distribution" className="flex-1 overflow-auto mt-4">
            {distributions.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>لم يتم توزيع المعاملة بعد</p>
              </div>
            ) : (
              <ul className="divide-y">
                {distributions.map((item) => (
                  <li key={item.id} className="py-3 border-b last:border-0">
                    <div className="flex justify-between">
                      <div className="font-medium">{item.distributed_to_department || 'موظف'}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(item.distribution_date).toLocaleString('ar-SA')}
                      </div>
                    </div>
                    <div className="mt-1 flex gap-2 items-center">
                      <span className="text-sm text-muted-foreground">الحالة:</span>
                      <Badge className={getStatusBadge(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    {item.instructions && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">التعليمات:</h4>
                        <p className="text-sm mt-1 p-2 bg-muted/30 rounded">{item.instructions}</p>
                      </div>
                    )}
                    {item.response_text && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">الرد:</h4>
                        <p className="text-sm mt-1 p-2 bg-muted/30 rounded">{item.response_text}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between gap-2">
          <Button variant="outline" onClick={onClose}>إغلاق</Button>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 ml-1" />
              إضافة تعليق
            </Button>
            <Button>
              <Download className="h-4 w-4 ml-1" />
              تنزيل
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
