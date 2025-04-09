import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Send, 
  Archive, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  MessageCircle, 
  ChevronRight, 
  Info,
  CalendarClock,
  FilePdf,
  Download,
  Users,
  User,
  ArrowRightCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Correspondence {
  id: string;
  number: string;
  subject: string;
  date: string;
  type: string;
  status: string;
  sender: string;
  recipient: string;
  content?: string;
  priority?: string;
  deadline_date?: string;
  tags?: string[];
  attachments_count?: number;
  hasMainDocument?: boolean;
}

interface MobileCorrespondenceViewProps {
  data: Correspondence[];
  loading?: boolean;
  selectedId?: string;
  onRefresh?: () => void;
}

export const MobileCorrespondenceView: React.FC<MobileCorrespondenceViewProps> = ({
  data,
  loading = false,
  selectedId,
  onRefresh
}) => {
  const [selectedItem, setSelectedItem] = useState<Correspondence | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const navigate = useNavigate();
  
  const handleSelectItem = async (item: Correspondence) => {
    setSelectedItem(item);
    setDetailsOpen(true);
    
    // جلب المرفقات
    await fetchAttachments(item.id);
  };
  
  const fetchAttachments = async (correspondenceId: string) => {
    setLoadingAttachments(true);
    try {
      const { data, error } = await supabase
        .from('correspondence_attachments')
        .select('*')
        .eq('correspondence_id', correspondenceId)
        .order('is_main_document', { ascending: false })
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      
      setAttachments(data || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
    } finally {
      setLoadingAttachments(false);
    }
  };
  
  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'outgoing':
        return <Send className="h-4 w-4 text-green-500" />;
      case 'letter':
        return <FileText className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'outgoing':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'letter':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return '';
    }
  };
  
  const getStatusColor = (status: string) => {
    if (status === 'مكتمل' || status === 'معتمد' || status === 'مرسل') {
      return 'bg-green-50 text-green-700 border-green-200';
    } else if (status === 'قيد المعالجة' || status === 'قيد الإعداد') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (status === 'مؤرشف') {
      return 'bg-gray-50 text-gray-700 border-gray-200';
    } else {
      return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  
  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'عاجل';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'عادي';
      default:
        return 'غير محدد';
    }
  };

  const handleNavigateToDetails = (id: string) => {
    setDetailsOpen(false);
    navigate(`/admin/correspondence/${id}`);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل المعاملات...</p>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-96">
        <FileText className="h-16 w-16 text-muted-foreground/60 mb-4" />
        <p className="text-lg text-muted-foreground">لا توجد معاملات للعرض</p>
        {onRefresh && (
          <Button variant="outline" className="mt-4" onClick={onRefresh}>
            تحديث البيانات
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-4">
        {data.map((item) => (
          <Card 
            key={item.id} 
            className={`${item.id === selectedId ? 'border-primary/60 shadow-md' : ''}`}
            onClick={() => handleSelectItem(item)}
          >
            <CardHeader className="p-4 pb-0">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <div className="flex items-center space-x-2 space-x-reverse mb-1">
                    {getTypeIcon(item.type)}
                    <Badge variant="outline" className={getTypeColor(item.type)}>
                      {item.type === 'incoming' ? 'وارد' : item.type === 'outgoing' ? 'صادر' : 'خطاب'}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    {item.priority && (
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {getPriorityText(item.priority)}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base truncate">
                    {item.subject}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-sm text-muted-foreground flex justify-between">
                <div>رقم: {item.number}</div>
                <div>{new Date(item.date).toLocaleDateString('ar-SA')}</div>
              </div>
              
              <div className="text-sm mt-2 space-y-1 text-muted-foreground">
                <div className="flex items-center">
                  <Send className="h-3 w-3 ml-1 flex-shrink-0" />
                  <span className="truncate">من: {item.sender}</span>
                </div>
                <div className="flex items-center">
                  <Archive className="h-3 w-3 ml-1 flex-shrink-0" />
                  <span className="truncate">إلى: {item.recipient}</span>
                </div>
                {item.deadline_date && (
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 ml-1 flex-shrink-0" />
                    <span>الموعد: {new Date(item.deadline_date).toLocaleDateString('ar-SA')}</span>
                  </div>
                )}
              </div>
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {item.attachments_count && item.attachments_count > 0 ? (
                  <div className="flex items-center">
                    <FileText className="h-3 w-3 ml-1" />
                    <span>{item.attachments_count} مرفقات</span>
                  </div>
                ) : null}
                
                {item.hasMainDocument && (
                  <div className="flex items-center">
                    <FilePdf className="h-3 w-3 ml-1" />
                    <span>مستند رئيسي</span>
                  </div>
                )}
              </div>
              
              <Button variant="ghost" size="icon" className="ml-2">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* واجهة عرض التفاصيل */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader className="text-right border-b pb-2 mb-4">
            <SheetTitle>{selectedItem?.subject}</SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(85vh-6rem)]">
            <div className="space-y-6 p-1">
              {/* قسم الرأس والحالة */}
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className={selectedItem?.type ? getTypeColor(selectedItem.type) : ''}>
                    {selectedItem?.type === 'incoming' ? 'وارد' : selectedItem?.type === 'outgoing' ? 'صادر' : 'خطاب'}
                  </Badge>
                  <Badge variant="outline" className={selectedItem?.status ? getStatusColor(selectedItem.status) : ''} className="mr-2">
                    {selectedItem?.status}
                  </Badge>
                </div>
                <div>
                  <Button variant="outline" size="sm" onClick={() => selectedItem && handleNavigateToDetails(selectedItem.id)}>
                    عرض الصفحة الكاملة
                    <ArrowRightCircle className="h-4 w-4 mr-1" />
                  </Button>
                </div>
              </div>
              
              {/* تفاصيل المعاملة */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">تفاصيل المعاملة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">الرقم:</span>
                      <p>{selectedItem?.number}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">التاريخ:</span>
                      <p>{selectedItem?.date ? new Date(selectedItem.date).toLocaleDateString('ar-SA') : 'غير محدد'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">المرسل:</span>
                      <p>{selectedItem?.sender}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">المستلم:</span>
                      <p>{selectedItem?.recipient}</p>
                    </div>
                    {selectedItem?.priority && (
                      <div>
                        <span className="text-muted-foreground">الأولوية:</span>
                        <p>{getPriorityText(selectedItem.priority)}</p>
                      </div>
                    )}
                    {selectedItem?.deadline_date && (
                      <div>
                        <span className="text-muted-foreground">الموعد النهائي:</span>
                        <p>{new Date(selectedItem.deadline_date).toLocaleDateString('ar-SA')}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedItem?.content && (
                    <div className="mt-4">
                      <span className="text-muted-foreground block mb-1">المحتوى:</span>
                      <div className="text-sm p-3 bg-muted rounded">
                        {selectedItem.content}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* المرفقات */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">المرفقات</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAttachments ? (
                    <div className="text-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">جاري تحميل المرفقات...</p>
                    </div>
                  ) : attachments.length === 0 ? (
                    <div className="text-center py-4">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                      <p className="text-sm text-muted-foreground">لا توجد مرفقات</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div 
                          key={attachment.id} 
                          className={`p-3 rounded border flex justify-between items-center ${
                            attachment.is_main_document ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <FilePdf className="h-5 w-5 text-red-500" />
                            <div>
                              <div className="font-medium text-sm">{attachment.file_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(attachment.uploaded_at).toLocaleDateString('ar-SA')}
                                {attachment.is_main_document && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mr-2 text-[10px]">
                                    رئيسي
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDownload(attachment.file_path, attachment.file_name)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* سير العمل أو اتخاذ إجراء */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">الإجراءات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => selectedItem && handleNavigateToDetails(selectedItem.id)}
                  >
                    <span>عرض وإدارة المعاملة</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

