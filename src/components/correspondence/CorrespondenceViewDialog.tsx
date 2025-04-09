import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCorrespondence, CorrespondenceAttachment, History } from "@/hooks/useCorrespondence";
import { 
  Paperclip, 
  Download, 
  Calendar, 
  Clock, 
  User, 
  Lock, 
  Flag, 
  Tag, 
  ExternalLink, 
  MessageCircle, 
  Link2, 
  FileText, 
  History as HistoryIcon,
  Share 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { DistributeCorrespondenceDialog } from "./DistributeCorrespondenceDialog";
import { CorrespondenceResponseDialog } from "./CorrespondenceResponseDialog";

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
  priority?: string;
  is_confidential?: boolean;
  tags?: string[];
  assigned_to?: string;
  related_correspondence_id?: string;
  created_by?: string;
}

interface CorrespondenceViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mail: Mail | null;
}

interface Distribution {
  id: string;
  correspondence_id: string;
  distributed_to: string;
  distributed_to_department: string;
  distribution_date: string;
  distributed_by: string;
  instructions: string;
  is_read: boolean;
  read_at: string;
  response_deadline: string;
  response_text: string;
  response_date: string;
  status: string;
}

interface UserInfo {
  id: string;
  display_name: string;
  email: string;
}

export const CorrespondenceViewDialog: React.FC<CorrespondenceViewDialogProps> = ({
  isOpen,
  onClose,
  mail,
}) => {
  const { getAttachments, getHistory, downloadAttachment } = useCorrespondence();
  const [attachments, setAttachments] = useState<CorrespondenceAttachment[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [relatedMail, setRelatedMail] = useState<Mail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [assignedToUser, setAssignedToUser] = useState<UserInfo | null>(null);
  const [createdByUser, setCreatedByUser] = useState<UserInfo | null>(null);
  const [distributedToUsers, setDistributedToUsers] = useState<{[key: string]: UserInfo | null}>({});
  const [distributedByUsers, setDistributedByUsers] = useState<{[key: string]: UserInfo | null}>({});
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (mail?.id) {
        setLoading(true);
        try {
          // Fetch attachments
          if (mail.hasAttachments) {
            const attachmentsList = await getAttachments(mail.id);
            setAttachments(attachmentsList);
          } else {
            setAttachments([]);
          }

          // Fetch history
          const historyData = await getHistory(mail.id);
          setHistory(historyData);

          // Fetch distributions
          const { data: distributionsData, error: distributionsError } = await supabase
            .from('correspondence_distribution')
            .select('*')
            .eq('correspondence_id', mail.id);

          if (!distributionsError && distributionsData) {
            setDistributions(distributionsData);

            // Collect all user IDs for fetching
            const userIds = new Set<string>();
            distributionsData.forEach(dist => {
              if (dist.distributed_to) userIds.add(dist.distributed_to);
              if (dist.distributed_by) userIds.add(dist.distributed_by);
            });

            // Fetch users info
            if (userIds.size > 0) {
              const { data: usersData } = await supabase
                .from('auth_users_view')
                .select('id, email, raw_user_meta_data');

              if (usersData) {
                const userMap: {[key: string]: UserInfo} = {};
                usersData.forEach(user => {
                  userMap[user.id] = {
                    id: user.id,
                    display_name: user.raw_user_meta_data?.name || user.email,
                    email: user.email
                  };
                });

                // Set distributed to/by users
                const distributedToMap: {[key: string]: UserInfo | null} = {};
                const distributedByMap: {[key: string]: UserInfo | null} = {};
                
                distributionsData.forEach(dist => {
                  if (dist.distributed_to) {
                    distributedToMap[dist.id] = userMap[dist.distributed_to] || null;
                  }
                  if (dist.distributed_by) {
                    distributedByMap[dist.id] = userMap[dist.distributed_by] || null;
                  }
                });

                setDistributedToUsers(distributedToMap);
                setDistributedByUsers(distributedByMap);
              }
            }
          } else {
            setDistributions([]);
          }

          // Fetch related mail if any
          if (mail.related_correspondence_id) {
            const { data: relatedMailData } = await supabase
              .from('correspondence')
              .select('*')
              .eq('id', mail.related_correspondence_id)
              .single();

            if (relatedMailData) {
              const hasAttachments = await checkHasAttachments(relatedMailData.id);
              setRelatedMail({
                ...relatedMailData,
                hasAttachments
              });
            }
          } else {
            setRelatedMail(null);
          }

          // Fetch assigned to and created by users
          if (mail.assigned_to || mail.created_by) {
            const userIds = [];
            if (mail.assigned_to) userIds.push(mail.assigned_to);
            if (mail.created_by) userIds.push(mail.created_by);

            const { data: usersData } = await supabase
              .from('auth_users_view')
              .select('id, email, raw_user_meta_data')
              .in('id', userIds);

            if (usersData) {
              usersData.forEach(user => {
                if (mail.assigned_to && user.id === mail.assigned_to) {
                  setAssignedToUser({
                    id: user.id,
                    display_name: user.raw_user_meta_data?.name || user.email,
                    email: user.email
                  });
                }
                if (mail.created_by && user.id === mail.created_by) {
                  setCreatedByUser({
                    id: user.id,
                    display_name: user.raw_user_meta_data?.name || user.email,
                    email: user.email
                  });
                }
              });
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen && mail?.id) {
      fetchData();
    } else {
      setAttachments([]);
      setHistory([]);
      setDistributions([]);
      setRelatedMail(null);
      setActiveTab("details");
    }
  }, [isOpen, mail, getAttachments, getHistory]);

  const checkHasAttachments = async (correspondenceId: string) => {
    const { data, error } = await supabase
      .from('correspondence_attachments')
      .select('id')
      .eq('correspondence_id', correspondenceId)
      .limit(1);
      
    return !error && data && data.length > 0;
  };

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

  // Get priority badge class
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'عاجل':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
      case 'متوسط':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low':
      case 'عادي':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA');
    } catch (error) {
      return dateString;
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      return `${date.toLocaleDateString('ar-SA')} ${date.toLocaleTimeString('ar-SA')}`;
    } catch (error) {
      return dateTimeString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl">{mail.subject}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="details" className="flex-1">التفاصيل</TabsTrigger>
            {distributions.length > 0 && (
              <TabsTrigger value="distribution" className="flex-1">التوزيع</TabsTrigger>
            )}
            {history.length > 0 && (
              <TabsTrigger value="history" className="flex-1">تاريخ المعاملة</TabsTrigger>
            )}
            {attachments.length > 0 && (
              <TabsTrigger value="attachments" className="flex-1">المرفقات</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">رقم المعاملة</p>
                <p className="font-medium">{mail.number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">التاريخ</p>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{mail.date}</p>
                </div>
              </div>
            </div>

            <Separator />

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

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <Badge className={`mt-1 ${getStatusBadge(mail.status)} border font-medium`}>
                  {mail.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">النوع</p>
                <Badge variant="outline" className="mt-1">
                  {mail.type === 'incoming' ? 'وارد' : mail.type === 'outgoing' ? 'صادر' : 'خطاب'}
                </Badge>
              </div>
            </div>

            {mail.priority && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">الأولوية</p>
                    <div className="flex items-center space-x-1 space-x-reverse mt-1">
                      <Flag className="h-4 w-4 text-muted-foreground" />
                      <Badge className={getPriorityBadge(mail.priority)}>
                        {mail.priority === 'high' ? 'عاجل' : mail.priority === 'medium' ? 'متوسط' : 'عادي'}
                      </Badge>
                    </div>
                  </div>
                  {mail.is_confidential !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">السرية</p>
                      <div className="flex items-center space-x-1 space-x-reverse mt-1">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={mail.is_confidential ? "destructive" : "outline"}>
                          {mail.is_confidential ? 'سري' : 'غير سري'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {(assignedToUser || createdByUser) && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  {assignedToUser && (
                    <div>
                      <p className="text-sm text-muted-foreground">مسند إلى</p>
                      <div className="flex items-center space-x-1 space-x-reverse mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{assignedToUser.display_name}</p>
                      </div>
                    </div>
                  )}
                  {createdByUser && (
                    <div>
                      <p className="text-sm text-muted-foreground">تم الإنشاء بواسطة</p>
                      <div className="flex items-center space-x-1 space-x-reverse mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{createdByUser.display_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {mail.tags && mail.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">الوسوم</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {mail.tags.map((tag, index) => (
                      <div key={index} className="flex items-center">
                        <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {relatedMail && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">المعاملة المرتبطة</p>
                  <div className="mt-1 p-3 border rounded-md bg-muted/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{relatedMail.subject}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <p className="ml-4">رقم: {relatedMail.number}</p>
                          <p>تاريخ: {formatDate(relatedMail.date)}</p>
                        </div>
                      </div>
                      <Link2 className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">المحتوى</p>
              <div className="mt-1 p-4 bg-muted/30 rounded-md">
                <p className="whitespace-pre-wrap">{mail.content || 'لا يوجد محتوى'}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <div className="bg-muted/20 p-3 rounded-md">
              <h3 className="font-medium mb-2">توزيع المعاملة</h3>
              {distributions.length === 0 ? (
                <p className="text-muted-foreground text-sm">لم يتم توزيع هذه المعاملة بعد</p>
              ) : (
                <div className="space-y-4">
                  {distributions.map((dist) => (
                    <div key={dist.id} className="border rounded-md p-3 bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {distributedToUsers[dist.id]?.display_name || dist.distributed_to_department || 'غير محدد'}
                          </p>
                          <div className="text-sm text-muted-foreground mt-1">
                            <p>تاريخ التوزيع: {formatDateTime(dist.distribution_date)}</p>
                            {dist.response_deadline && (
                              <p>موعد الاستجابة: {formatDate(dist.response_deadline)}</p>
                            )}
                          </div>
                        </div>
                        <Badge className={`${getStatusBadge(dist.status)} border font-medium`}>
                          {dist.status}
                        </Badge>
                      </div>

                      {dist.instructions && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">التعليمات:</p>
                          <p className="text-sm mt-1 p-2 bg-muted/20 rounded">{dist.instructions}</p>
                        </div>
                      )}

                      {dist.response_text && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">الرد:</p>
                          <div className="flex items-start mt-1 p-2 bg-muted/20 rounded">
                            <MessageCircle className="h-4 w-4 ml-2 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm">{dist.response_text}</p>
                              {dist.response_date && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDateTime(dist.response_date)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 text-xs text-muted-foreground">
                        <p>
                          تم التوزيع بواسطة: {distributedByUsers[dist.id]?.display_name || 'غير محدد'}
                        </p>
                        <p>
                          حالة القراءة: {dist.is_read ? `تمت القراءة (${formatDateTime(dist.read_at)})` : 'لم تتم القراءة بعد'}
                        </p>
                      </div>
                      
                      {dist.status !== 'مكتمل' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => {
                            setSelectedDistribution(dist.id);
                            setIsResponseDialogOpen(true);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 ml-1" />
                          الرد على المعاملة
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="bg-muted/20 p-3 rounded-md">
              <h3 className="font-medium mb-2">تاريخ التغييرات</h3>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-sm">لا يوجد سجل تاريخي للتغييرات</p>
              ) : (
                <div className="space-y-3">
                  {history.map((historyItem) => (
                    <div key={historyItem.id} className="border-r-2 border-primary pr-4 pb-3">
                      <div className="flex items-start">
                        <div className="bg-primary h-3 w-3 rounded-full mr-[-25px] mt-1.5"></div>
                        <div className="flex-1 mr-4">
                          <p className="font-medium text-sm">{historyItem.action_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(historyItem.action_date || '')}
                          </p>
                          
                          {(historyItem.previous_status || historyItem.new_status) && (
                            <div className="mt-1 bg-muted/30 p-2 rounded text-sm">
                              {historyItem.previous_status && (
                                <p>الحالة السابقة: <Badge className={getStatusBadge(historyItem.previous_status)}>{historyItem.previous_status}</Badge></p>
                              )}
                              {historyItem.new_status && (
                                <p className="mt-1">الحالة الجديدة: <Badge className={getStatusBadge(historyItem.new_status)}>{historyItem.new_status}</Badge></p>
                              )}
                            </div>
                          )}
                          
                          {historyItem.action_details && (
                            <p className="mt-1 text-sm">{historyItem.action_details}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">المرفقات</h3>
              <div className="mt-1 space-y-2">
                {loading ? (
                  <div className="text-center py-2">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="mr-2 text-sm">جاري تحميل المرفقات...</span>
                  </div>
                ) : attachments.length > 0 ? (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
                      >
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="bg-primary/10 p-2 rounded">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{attachment.file_name}</p>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <p>{attachment.file_type || 'ملف'}</p>
                              {attachment.file_size && (
                                <p className="mr-2">({(attachment.file_size / 1024).toFixed(2)} كيلوبايت)</p>
                              )}
                              {attachment.is_main_document && (
                                <Badge className="bg-blue-100 text-blue-800 mr-2">المستند الرئيسي</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="space-x-1 space-x-reverse"
                          onClick={() => downloadAttachment(attachment.file_path, attachment.file_name)}
                        >
                          <Download className="h-4 w-4" />
                          <span>تنزيل</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">لا توجد مرفقات</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* إضافة زر لتوزيع المعاملة */}
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              setIsDistributeDialogOpen(true);
            }}
          >
            <Share className="h-4 w-4" />
            <span>توزيع المعاملة</span>
          </Button>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* إضافة نافذة حوار توزيع المعاملة */}
      {mail && isDistributeDialogOpen && (
        <DistributeCorrespondenceDialog
          isOpen={isDistributeDialogOpen}
          onClose={() => setIsDistributeDialogOpen(false)}
          correspondenceId={mail.id}
        />
      )}
      
      {/* نافذة حوار الرد على المعاملة */}
      {mail && selectedDistribution && isResponseDialogOpen && (
        <CorrespondenceResponseDialog
          isOpen={isResponseDialogOpen}
          onClose={() => setIsResponseDialogOpen(false)}
          distributionId={selectedDistribution}
          correspondenceId={mail.id}
        />
      )}
    </Dialog>
  );
};
