
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestStatusBadge } from "../StatusBadge";
import { RequestPriorityBadge } from "../PriorityBadge";
import { FormDataDisplay } from "./FormDataDisplay";
import { ApprovalsTab } from "./ApprovalsTab";
import { AttachmentsTab } from "./AttachmentsTab";
import { WorkflowCard } from "./WorkflowCard";
import { RequestDetails } from "@/features/requests/types/request.types";

interface DetailsContentProps {
  requestDetails: RequestDetails;
}

export const DetailsContent = ({ requestDetails }: DetailsContentProps) => {
  const { request, request_type, workflow, current_step, approvals, attachments } = requestDetails;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{request.title}</h3>
                <p className="text-muted-foreground">
                  نوع الطلب: {request_type?.name || "غير محدد"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <RequestStatusBadge status={request.status} />
                <RequestPriorityBadge priority={request.priority} />
              </div>
            </div>

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
                  
                  <FormDataDisplay formData={request.form_data} />
                </div>
              </TabsContent>
              
              <TabsContent value="approvals">
                <ApprovalsTab approvals={approvals || []} />
              </TabsContent>
              
              <TabsContent value="attachments">
                <AttachmentsTab attachments={attachments || []} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <WorkflowCard 
          workflow={workflow}
          currentStep={current_step}
        />
      </div>
    </div>
  );
};
