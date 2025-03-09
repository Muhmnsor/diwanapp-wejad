
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Button 
} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Check, 
  X, 
  FileText, 
  Clock, 
  User, 
  Calendar,
  PaperclipIcon 
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

interface RequestDetailProps {
  requestId: string;
  onClose: () => void;
}

export const RequestDetail = ({ requestId, onClose }: RequestDetailProps) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [comments, setComments] = useState("");

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          request_type:request_types(*),
          workflow:request_workflows(*),
          current_step:workflow_steps(*)
        `)
        .eq("id", requestId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: approvals, isLoading: approvalsLoading } = useQuery({
    queryKey: ["approvals", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("request_approvals")
        .select(`
          *,
          step:workflow_steps(*),
          approver:profiles(display_name, email)
        `)
        .eq("request_id", requestId)
        .order("created_at");
      
      if (error) throw error;
      return data;
    }
  });

  const { data: attachments, isLoading: attachmentsLoading } = useQuery({
    queryKey: ["attachments", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("request_attachments")
        .select(`
          *,
          uploader:profiles(display_name, email)
        `)
        .eq("request_id", requestId)
        .order("created_at");
      
      if (error) throw error;
      return data;
    }
  });

  const approveRequest = useMutation({
    mutationFn: async () => {
      // First create an approval record
      const { data: approvalData, error: approvalError } = await supabase
        .from("request_approvals")
        .insert({
          request_id: requestId,
          step_id: request?.current_step?.id,
          approver_id: user?.id,
          status: "approved",
          comments: comments,
          approved_at: new Date().toISOString()
        })
        .select();
      
      if (approvalError) throw approvalError;

      // Update the request status
      const { error: requestError } = await supabase
        .from("requests")
        .update({
          status: "approved"
        })
        .eq("id", requestId);
      
      if (requestError) throw requestError;

      return approvalData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", requestId] });
      queryClient.invalidateQueries({ queryKey: ["approvals", requestId] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("تمت الموافقة على الطلب بنجاح");
      setIsApproveDialogOpen(false);
      setComments("");
    },
    onError: (error) => {
      console.error("Error approving request:", error);
      toast.error("حدث خطأ أثناء الموافقة على الطلب");
    }
  });

  const rejectRequest = useMutation({
    mutationFn: async () => {
      // First create a rejection record
      const { data: rejectionData, error: rejectionError } = await supabase
        .from("request_approvals")
        .insert({
          request_id: requestId,
          step_id: request?.current_step?.id,
          approver_id: user?.id,
          status: "rejected",
          comments: comments,
          approved_at: new Date().toISOString()
        })
        .select();
      
      if (rejectionError) throw rejectionError;

      // Update the request status
      const { error: requestError } = await supabase
        .from("requests")
        .update({
          status: "rejected"
        })
        .eq("id", requestId);
      
      if (requestError) throw requestError;

      return rejectionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", requestId] });
      queryClient.invalidateQueries({ queryKey: ["approvals", requestId] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("تم رفض الطلب بنجاح");
      setIsRejectDialogOpen(false);
      setComments("");
    },
    onError: (error) => {
      console.error("Error rejecting request:", error);
      toast.error("حدث خطأ أثناء رفض الطلب");
    }
  });

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">مسودة</Badge>;
      case 'pending':
        return <Badge variant="secondary">قيد الانتظار</Badge>;
      case 'in_progress':
        return <Badge variant="default">قيد المعالجة</Badge>;
      case 'approved':
        return <Badge variant="success" className="bg-green-500 hover:bg-green-600">تمت الموافقة</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-200">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline">منخفضة</Badge>;
      case 'medium':
        return <Badge variant="secondary">متوسطة</Badge>;
      case 'high':
        return <Badge variant="default">عالية</Badge>;
      case 'urgent':
        return <Badge variant="destructive">عاجلة</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const handleApproveClick = () => {
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = () => {
    setIsRejectDialogOpen(true);
  };

  const renderFormData = (formData: Record<string, any>) => {
    return Object.entries(formData).map(([key, value]) => {
      // Handle different types of form data
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return (
          <div key={key} className="mb-4">
            <h4 className="font-medium mb-2">{key}</h4>
            <div className="pl-4 border-l-2 border-gray-200">
              {renderFormData(value)}
            </div>
          </div>
        );
      }
      
      if (Array.isArray(value)) {
        return (
          <div key={key} className="mb-4">
            <h4 className="font-medium mb-2">{key}</h4>
            <div className="pl-4 border-l-2 border-gray-200">
              {value.map((item, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                  {typeof item === 'object' ? renderFormData(item) : item.toString()}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      return (
        <div key={key} className="mb-2 grid grid-cols-2">
          <span className="font-medium">{key}:</span>
          <span>{value?.toString() || "-"}</span>
        </div>
      );
    });
  };

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  if (!request) {
    return <div>لم يتم العثور على الطلب</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">تفاصيل الطلب</h2>
          <div className="flex gap-2">
            {request.status === 'pending' || request.status === 'in_progress' ? (
              <>
                <Button variant="outline" onClick={handleRejectClick} className="bg-red-50 text-red-600 hover:bg-red-100">
                  <X className="mr-2 h-4 w-4" />
                  رفض الطلب
                </Button>
                <Button onClick={handleApproveClick} className="bg-green-600 hover:bg-green-700">
                  <Check className="mr-2 h-4 w-4" />
                  الموافقة على الطلب
                </Button>
              </>
            ) : null}
            <Button variant="outline" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{request.title}</CardTitle>
                    <CardDescription>
                      نوع الطلب: {request.request_type?.name}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {renderStatusBadge(request.status)}
                    {renderPriorityBadge(request.priority)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">تفاصيل الطلب</TabsTrigger>
                    <TabsTrigger value="approvals">الموافقات</TabsTrigger>
                    <TabsTrigger value="attachments">المرفقات</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            تاريخ الإنشاء: {format(new Date(request.created_at), "yyyy-MM-dd")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            مقدم الطلب: {request.requester_id}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="font-medium mb-4">بيانات النموذج</h3>
                        {renderFormData(request.form_data)}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="approvals">
                    {approvalsLoading ? (
                      <div>جاري التحميل...</div>
                    ) : approvals && approvals.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>الخطوة</TableHead>
                            <TableHead>المسؤول</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>التعليقات</TableHead>
                            <TableHead>تاريخ الإجراء</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvals.map((approval) => (
                            <TableRow key={approval.id}>
                              <TableCell>{approval.step?.step_name || "خطوة غير معروفة"}</TableCell>
                              <TableCell>{approval.approver?.display_name || approval.approver?.email || "غير معروف"}</TableCell>
                              <TableCell>
                                {approval.status === "approved" ? 
                                  <Badge variant="success" className="bg-green-500">تمت الموافقة</Badge> : 
                                  <Badge variant="destructive">مرفوض</Badge>}
                              </TableCell>
                              <TableCell>{approval.comments || "-"}</TableCell>
                              <TableCell>
                                {approval.approved_at ? format(new Date(approval.approved_at), "yyyy-MM-dd") : "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">لا توجد موافقات حتى الآن</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="attachments">
                    {attachmentsLoading ? (
                      <div>جاري التحميل...</div>
                    ) : attachments && attachments.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {attachments.map((attachment) => (
                          <Card key={attachment.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <PaperclipIcon className="h-8 w-8 text-primary" />
                                <div>
                                  <p className="font-medium">{attachment.file_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    تم الرفع بواسطة: {attachment.uploader?.display_name || attachment.uploader?.email || "غير معروف"}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-end p-4 pt-0">
                              <Button variant="outline" size="sm">
                                تنزيل الملف
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">لا توجد مرفقات</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>مسار العمل</CardTitle>
                <CardDescription>
                  {request.workflow?.name || "لا يوجد مسار عمل محدد"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {request.workflow ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-md">
                      <h4 className="font-medium mb-2">الخطوة الحالية</h4>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{request.current_step?.step_name || "غير محدد"}</span>
                      </div>
                      {request.current_step?.instructions && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {request.current_step.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">لا يوجد مسار عمل محدد لهذا الطلب</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>الموافقة على الطلب</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في الموافقة على هذا الطلب؟
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="comments" className="block text-sm font-medium mb-2">
              التعليقات (اختياري)
            </label>
            <Textarea
              id="comments"
              placeholder="أضف تعليقًا..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => approveRequest.mutate()} disabled={approveRequest.isPending} className="bg-green-600 hover:bg-green-700">
              {approveRequest.isPending ? "جاري المعالجة..." : "موافقة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض الطلب</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في رفض هذا الطلب؟
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="reject-comments" className="block text-sm font-medium mb-2">
              سبب الرفض (مطلوب)
            </label>
            <Textarea
              id="reject-comments"
              placeholder="أدخل سبب الرفض..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="border-red-200 focus:border-red-300"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectRequest.mutate()}
              disabled={rejectRequest.isPending || !comments.trim()}
            >
              {rejectRequest.isPending ? "جاري المعالجة..." : "رفض الطلب"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
