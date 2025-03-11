
import { useState } from "react";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { RequestPriorityBadge } from "./RequestPriorityBadge";
import { RequestApprovalsTab } from "./RequestApprovalsTab";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { diagnoseRequestWorkflow } from "../utils/workflowHelpers";
import { Button } from "@/components/ui/button";

interface RequestDetailsCardProps {
  request: any;
  requestType: any;
  approvals: any[];
  attachments?: any[];
}

export const RequestDetailsCard = ({ 
  request, 
  requestType, 
  approvals, 
  attachments = [] 
}: RequestDetailsCardProps) => {
  const [workflowDiagnosis, setWorkflowDiagnosis] = useState<any>(null);
  const [diagnosing, setDiagnosing] = useState(false);

  const handleDiagnoseWorkflow = async () => {
    if (!request?.id) return;
    
    setDiagnosing(true);
    try {
      const diagnosis = await diagnoseRequestWorkflow(request.id);
      setWorkflowDiagnosis(diagnosis);
      console.log("Workflow diagnosis:", diagnosis);
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{request.title}</CardTitle>
            <CardDescription>{requestType?.name || "نوع الطلب غير محدد"}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <RequestStatusBadge status={request.status} />
            <RequestPriorityBadge priority={request.priority} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">تاريخ الإنشاء</p>
            <p className="font-medium">
              {request.created_at ? format(new Date(request.created_at), "yyyy-MM-dd") : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">مقدم الطلب</p>
            <p className="font-medium">
              {request.requester?.display_name || request.requester?.email || "-"}
            </p>
          </div>
        </div>

        {request.workflow_id && request.status === "pending" && (
          <div className="mb-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                هذا الطلب مرتبط بمسار سير عمل وينتظر الموافقة من المعتمدين المختصين
                {diagnosing ? (
                  <span className="block mt-2 text-sm animate-pulse">جاري تشخيص مسار العمل...</span>
                ) : (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="block mt-2 p-0 text-blue-700 underline"
                    onClick={handleDiagnoseWorkflow}
                  >
                    تشخيص حالة مسار العمل
                  </Button>
                )}
              </AlertDescription>
            </Alert>
            
            {workflowDiagnosis && workflowDiagnosis.issues && workflowDiagnosis.issues.length > 0 && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-bold mb-1">تم اكتشاف مشاكل في مسار العمل:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {workflowDiagnosis.issues.map((issue: string, idx: number) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">تفاصيل الطلب</TabsTrigger>
            <TabsTrigger value="approvals">الموافقات</TabsTrigger>
            {attachments.length > 0 && (
              <TabsTrigger value="attachments">المرفقات</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="details">
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="font-medium mb-2">بيانات الطلب</h3>
              {request.form_data ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(request.form_data).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-muted-foreground mb-1">{key}</p>
                      <p className="font-medium">{String(value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">لا توجد بيانات إضافية للطلب</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="approvals">
            <RequestApprovalsTab approvals={approvals} />
          </TabsContent>
          
          {attachments.length > 0 && (
            <TabsContent value="attachments">
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                    <span>{attachment.name || `مرفق ${index + 1}`}</span>
                    <a
                      href={attachment.url}
                      download
                      className="text-primary hover:underline"
                    >
                      تحميل
                    </a>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};
