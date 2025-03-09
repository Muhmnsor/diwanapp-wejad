
import { Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        {workflow ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">الخطوة الحالية</h4>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{currentStep?.step_name || "غير محدد"}</span>
              </div>
              {currentStep?.instructions && (
                <p className="text-sm text-muted-foreground mt-2">
                  {currentStep.instructions}
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
  );
};
