
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, FileText, Clock, PaperclipIcon, MessageSquareText, ListChecks } from "lucide-react";
import { ApprovalHistoryList } from "./ApprovalHistoryList";
import { AttachmentsList } from "./AttachmentsList";
import { RequestFormData } from "./RequestFormData";
interface RequestDetailsCardProps {
  request: any;
  requestType: any;
  approvals: any[];
  attachments: any[];
}
export const RequestDetailsCard = ({
  request,
  requestType,
  approvals,
  attachments
}: RequestDetailsCardProps) => {
  if (!request) return null;
  return <Card className="w-full overflow-hidden" dir="rtl">
      <CardHeader className="bg-muted/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <CardTitle className="my-[19px]">{request.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              <span>مقدم الطلب: {request.requester?.display_name || 'غير معروف'}</span>
              <span className="mx-2">•</span>
              <span>نوع الطلب: {requestType?.name || 'غير محدد'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RequestStatusBadge status={request.status} />
            {request.due_date && <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 ml-1" />
                <span>
                  {format(new Date(request.due_date), 'P', {
                locale: ar
              })}
                </span>
              </div>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">
              <FileText className="h-4 w-4 ml-2" />
              تفاصيل الطلب
            </TabsTrigger>
            <TabsTrigger value="approvals">
              <ListChecks className="h-4 w-4 ml-2" />
              سجل الاعتمادات ({approvals?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="attachments">
              <PaperclipIcon className="h-4 w-4 ml-2" />
              المرفقات ({attachments?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <CalendarClock className="h-4 w-4 text-muted-foreground ml-1" />
                <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                <span className="font-medium">
                  {format(new Date(request.created_at), 'PPpp', {
                  locale: ar
                })}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MessageSquareText className="h-4 w-4 text-muted-foreground ml-1" />
                <span className="text-muted-foreground">الحالة:</span>
                <RequestStatusBadge status={request.status} />
              </div>
            </div>
            
            <RequestFormData formData={request.form_data} formSchema={requestType?.form_schema} />
          </TabsContent>
          
          <TabsContent value="approvals">
            <ApprovalHistoryList approvals={approvals || []} />
          </TabsContent>
          
          <TabsContent value="attachments">
            <AttachmentsList attachments={attachments || []} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>;
};
