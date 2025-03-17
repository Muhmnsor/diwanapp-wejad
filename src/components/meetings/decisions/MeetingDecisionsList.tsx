
import { useState } from "react";
import { useMeetingDecisions } from "@/hooks/meetings/useMeetingDecisions";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddDecisionDialog } from "./AddDecisionDialog";
import { DecisionStatusBadge } from "./DecisionStatusBadge";

interface MeetingDecisionsListProps {
  meetingId?: string;
}

export const MeetingDecisionsList = ({ meetingId }: MeetingDecisionsListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { 
    data: decisions = [], 
    isLoading, 
    error,
    refetch 
  } = useMeetingDecisions(meetingId);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل قرارات الاجتماع...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل قرارات الاجتماع: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">قرارات الاجتماع ({decisions.length})</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <FileText className="mr-2 h-4 w-4" />
          إضافة قرار
        </Button>
      </div>
      
      {decisions.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border">
          <p className="text-muted-foreground">لا توجد قرارات مسجلة لهذا الاجتماع</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة قرار جديد
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">الرقم</TableHead>
                <TableHead>القرار</TableHead>
                <TableHead>المسؤول</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decisions.map((decision) => (
                <TableRow key={decision.id}>
                  <TableCell className="font-medium">#{decision.order_number}</TableCell>
                  <TableCell>{decision.decision_text}</TableCell>
                  <TableCell>
                    {decision.responsible_user_id ? (
                      <span>اسم المسؤول</span> // سيتم استبداله لاحقاً بمعلومات المستخدم
                    ) : (
                      <span className="text-muted-foreground text-sm">غير محدد</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {decision.due_date ? (
                      <span>{new Date(decision.due_date).toLocaleDateString('ar-SA')}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">غير محدد</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DecisionStatusBadge status={decision.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-start gap-2">
                      <Button variant="ghost" size="sm">
                        تعديل
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {meetingId && (
        <AddDecisionDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          meetingId={meetingId}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};
