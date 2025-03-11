
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RequestWorkflowCardProps {
  workflow: any;
  currentStep: any;
}

export const RequestWorkflowCard = ({ workflow, currentStep }: RequestWorkflowCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>مسار العمل</CardTitle>
        <CardDescription>
          {workflow?.name || "لا يوجد مسار عمل محدد"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {workflow && workflow.id ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">الخطوة الحالية</h4>
              {currentStep && currentStep.id ? (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">{currentStep.step_name || "غير محدد"}</span>
                  </div>
                  {currentStep.instructions && (
                    <p className="text-sm text-muted-foreground mt-2 border-r-2 border-primary pr-3 py-1">
                      {currentStep.instructions}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>لا توجد خطوة حالية محددة</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="bg-primary/10">
                {workflow.description || "مسار عمل" }
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">لا يوجد مسار عمل محدد لهذا الطلب</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
