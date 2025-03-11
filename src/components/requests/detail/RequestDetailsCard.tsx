
import { format } from "date-fns";
import { Calendar, User } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestFormDataDisplay } from "./RequestFormDataDisplay";
import { RequestApprovalsTab } from "./RequestApprovalsTab";
import { RequestAttachmentsTab } from "./RequestAttachmentsTab";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { RequestPriorityBadge } from "./RequestPriorityBadge";

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
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{request.title}</CardTitle>
            <CardDescription>
              نوع الطلب: {requestType?.name || "غير محدد"}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <RequestStatusBadge status={request.status} />
            <RequestPriorityBadge priority={request.priority} />
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
                    مقدم الطلب: {request.requester?.display_name || "غير معروف"}
                  </span>
                </div>
              </div>
              
              <RequestFormDataDisplay formData={request.form_data} />
            </div>
          </TabsContent>
          
          <TabsContent value="approvals">
            <RequestApprovalsTab approvals={approvals} />
          </TabsContent>
          
          <TabsContent value="attachments">
            <RequestAttachmentsTab attachments={attachments} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
