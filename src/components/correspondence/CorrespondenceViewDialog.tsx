import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Printer, Calendar, Clock, FileText, User, Users, Tag, Link2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CorrespondenceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  correspondenceId?: string | null;
}

interface AttachmentType {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
  is_main_document?: boolean;
}

interface DistributionType {
  id: string;
  correspondence_id: string;
  distributed_by: string;
  distributed_to: string;
  distributed_to_department: string;
  distribution_date: string;
  status: string;
  instructions: string;
  response_text: string | null;
  response_deadline: string | null;
  response_date: string | null;
  is_read: boolean;
  read_at: string | null;
  distributed_by_user?: {
    display_name: string;
    email: string;
  };
  distributed_to_user?: {
    display_name: string;
    email: string;
  };
}

interface HistoryType {
  id: string;
  correspondence_id: string;
  action_type: string;
  action_by: string;
  action_date: string;
  previous_status: string;
  new_status: string;
  action_details: string;
  action_by_user?: {
    display_name: string;
  };
}

interface RelatedCorrespondenceType {
  id: string;
  number: string;
  subject: string;
  date: string;
  type: string;
}

export function CorrespondenceViewDialog({
  open,
  onOpenChange,
  correspondenceId,
}: CorrespondenceViewDialogProps) {
  const [correspondence, setCorrespondence] = useState<any | null>(null);
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
  const [distributions, setDistributions] = useState<DistributionType[]>([]);
  const [history, setHistory] = useState<HistoryType[]>([]);
  const [relatedCorrespondence, setRelatedCorrespondence] = useState<RelatedCorrespondenceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignedToUser, setAssignedToUser] = useState<any | null>(null);
  const [createdByUser, setCreatedByUser] = useState<any | null>(null);

  useEffect(() => {
    if (open && correspondenceId) {
      loadCorrespondenceDetails();
    }
  }, [open, correspondenceId]);

  const loadCorrespondenceDetails = async () => {
    if (!correspondenceId) return;
    
    setLoading(true);
    try {
      // Load main correspondence data
      const { data: correspondenceData, error } = await supabase
        .from("correspondence")
        .select("*")
        .eq("id", correspondenceId)
        .single();

      if (error) {
        throw error;
      }

      setCorrespondence(correspondenceData);

      // Load attachments
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from("correspondence_attachments")
        .select("*")
        .eq("correspondence_id", correspondenceId);

      if (attachmentsError) {
        throw attachmentsError;
      }
      
      setAttachments(attachmentsData || []);

      // Load distribution information
      const { data: distributionsData, error: distributionsError } = await supabase
        .from("correspondence_distribution")
        .select(`
          *,
          distributed_by_user:distributed_by(id, display_name, email),
          distributed_to_user:distributed_to(id, display_name, email)
        `)
        .eq("correspondence_id", correspondenceId);

      if (distributionsError) {
        throw distributionsError;
      }

      setDistributions(distributionsData || []);

      // Load history
      const { data: historyData, error: historyError } = await supabase
        .from("correspondence_history")
        .select(`
          *,
          action_by_user:action_by(display_name)
        `)
        .eq("correspondence_id", correspondenceId)
        .order("action_date", { ascending: false });

      if (historyError) {
        throw historyError;
      }

      setHistory(historyData || []);

      // Load related correspondence if there's a related_correspondence_id
      if (correspondenceData.related_correspondence_id) {
        const { data: relatedData, error: relatedError } = await supabase
          .from("correspondence")
          .select("id, number, subject, date, type")
          .eq("id", correspondenceData.related_correspondence_id)
          .single();

        if (!relatedError) {
          setRelatedCorrespondence(relatedData);
        }
      }

      // Load assigned user data if there's an assigned_to field
      if (correspondenceData.assigned_to) {
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("id, display_name, email")
          .eq("id", correspondenceData.assigned_to)
          .single();

        if (!userError) {
          setAssignedToUser(userData);
        }
      }

      // Load created by user data
      if (correspondenceData.created_by) {
        const { data: creatorData, error: creatorError } = await supabase
          .from("profiles")
          .select("id, display_name, email")
          .eq("id", correspondenceData.created_by)
          .single();

        if (!creatorError) {
          setCreatedByUser(creatorData);
        }
      }
      
    } catch (err) {
      console.error("Error loading correspondence details:", err);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل بيانات المعاملة",
        description: "حدث خطأ أثناء محاولة تحميل تفاصيل المعاملة"
      });
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'قيد المعالجة':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">قيد المعالجة</Badge>;
      case 'مكتمل':
        return <Badge className="bg-green-100 text-green-800 border-green-300">مكتمل</Badge>;
      case 'معلق':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">معلق</Badge>;
      case 'مرسل':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">مرسل</Badge>;
      case 'قيد الإعداد':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">قيد الإعداد</Badge>;
      case 'معتمد':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">معتمد</Badge>;
      case 'مسودة':
        return <Badge className="bg-slate-100 text-slate-800 border-slate-300">مسودة</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'وارد':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">وارد</Badge>;
      case 'صادر':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">صادر</Badge>;
      case 'داخلي':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">داخلي</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'عاجل':
        return <Badge variant="destructive">عاجل</Badge>;
      case 'مهم':
        return <Badge className="bg-amber-500">مهم</Badge>;
      case 'عادي':
      default:
        return <Badge variant="outline">عادي</Badge>;
    }
  };

  const getDistributionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">مكتمل</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">قيد الانتظار</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">قيد المعالجة</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">مرفوض</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleDownloadAttachment = async (attachment: AttachmentType) => {
    try {
      const { data, error } = await supabase.storage
        .from('correspondence')
        .download(attachment.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل الملف",
        description: "حدث خطأ أثناء محاولة تحميل الملف"
      });
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل المعاملة</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!correspondence) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل المعاملة</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-amber-500" />
              <p className="text-muted-foreground">لم يتم العثور على بيانات المعاملة</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>تفاصيل المعاملة {correspondence.number}</span>
            <div className="flex items-center gap-2">
              {getTypeBadge(correspondence.type)}
              {getStatusBadge(correspondence.status)}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="details" className="h-full flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="details">التفاصيل</TabsTrigger>
              <TabsTrigger value="distribution">التوزيع ({distributions.length})</TabsTrigger>
              <TabsTrigger value="history">السجل ({history.length})</TabsTrigger>
              <TabsTrigger value="attachments">المرفقات ({attachments.length})</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="details" className="h-full overflow-auto">
                <ScrollArea className="h-[500px] pr-4">
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
                            {getPriorityBadge(correspondence.priority)}
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
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="distribution" className="h-full overflow-auto">
                <ScrollArea className="h-[500px] pr-4">
                  {distributions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لم يتم توزيع هذه المعاملة بعد
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {distributions.map((distribution) => (
                        <div key={distribution.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium flex items-center">
                                <User className="h-4 w-4 ml-1" />
                                {distribution.distributed_to_user?.display_name || "مستخدم"}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {distribution.distributed_to_department && (
                                  <span className="ml-2">{distribution.distributed_to_department}</span>
                                )}
                              </p>
                            </div>
                            <div>
                              {getDistributionStatusBadge(distribution.status)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm mb-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">تاريخ التوزيع:</span>
                              <span>{formatDateTime(distribution.distribution_date)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">وزعت بواسطة:</span>
                              <span>{distribution.distributed_by_user?.display_name || "-"}</span>
                            </div>
                            {distribution.response_deadline && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">الموعد النهائي للرد:</span>
                                <span>{formatDate(distribution.response_deadline)}</span>
                              </div>
                            )}
                            {distribution.response_date && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">تاريخ الرد:</span>
                                <span>{formatDateTime(distribution.response_date)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">حالة القراءة:</span>
                              <span>
                                {distribution.is_read ? (
                                  <span className="text-green-600">تمت القراءة {distribution.read_at ? `(${formatDateTime(distribution.read_at)})` : ""}</span>
                                ) : (
                                  <span className="text-amber-600">لم تتم القراءة</span>
                                )}
                              </span>
                            </div>
                          </div>

                          {distribution.instructions && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium mb-1">التعليمات:</h5>
                              <div className="p-2 bg-gray-50 rounded border text-sm">
                                {distribution.instructions}
                              </div>
                            </div>
                          )}

                          {distribution.response_text && (
                            <div>
                              <h5 className="text-sm font-medium mb-1">الرد:</h5>
                              <div className="p-2 bg-blue-50 rounded border text-sm">
                                {distribution.response_text}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="history" className="h-full overflow-auto">
                <ScrollArea className="h-[500px] pr-4">
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لا يوجد سجل للإجراءات بعد
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline view */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                      
                      <div className="space-y-6 py-2">
                        {history.map((entry, index) => (
                          <div key={entry.id} className="relative pl-8">
                            <div className={cn(
                              "absolute left-0 rounded-full w-8 h-8 flex items-center justify-center",
                              entry.action_type === 'status_change' ? 'bg-blue-100' : 'bg-gray-100'
                            )}>
                              <Clock className="h-4 w-4 text-gray-600" />
                            </div>
                            
                            <div className="bg-white border rounded-md p-3 shadow-sm">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-sm">
                                    {entry.action_type === 'status_change' ? 'تغيير الحالة' : 'إجراء على المعاملة'}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    بواسطة {entry.action_by_user?.display_name || "مستخدم"}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatDateTime(entry.action_date)}
                                </span>
                              </div>
                              
                              {entry.action_type === 'status_change' && (
                                <div className="mt-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-gray-50">{entry.previous_status || "حالة سابقة"}</Badge>
                                    <span>→</span>
                                    <Badge className="bg-blue-50 text-blue-700">{entry.new_status || "حالة جديدة"}</Badge>
                                  </div>
                                </div>
                              )}
                              
                              {entry.action_details && (
                                <div className="mt-2 text-sm text-gray-600">
                                  {entry.action_details}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="attachments" className="h-full overflow-auto">
                <ScrollArea className="h-[500px] pr-4">
                  {attachments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد مرفقات لهذه المعاملة
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Main document section */}
                      {attachments.some(att => att.is_main_document) && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">المستند الرئيسي</h4>
                          <div className="space-y-2">
                            {attachments
                              .filter(att => att.is_main_document)
                              .map((attachment) => (
                                <div 
                                  key={attachment.id} 
                                  className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-md"
                                >
                                  <div className="flex items-center">
                                    <FileText className="h-5 w-5 ml-2 text-blue-600" />
                                    <div>
                                      <p className="font-medium">{attachment.file_name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {(attachment.file_size / 1024).toFixed(2)} كيلوبايت • تم الرفع {formatDateTime(attachment.uploaded_at)}
                                      </p>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDownloadAttachment(attachment)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Other attachments */}
                      <h4 className="font-medium mb-2">المرفقات</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {attachments
                          .filter(att => !att.is_main_document)
                          .map((attachment) => (
                            <div 
                              key={attachment.id}
                              className="flex items-center justify-between p-3 bg-gray-50 border rounded-md"
                            >
                              <div className="flex items-center overflow-hidden">
                                <FileText className="h-5 w-5 ml-2 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{attachment.file_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(attachment.file_size / 1024).toFixed(2)} كيلوبايت
                                  </p>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadAttachment(attachment)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 ml-1" />
              طباعة
            </Button>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
