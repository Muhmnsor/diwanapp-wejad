
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { RequestType } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestTypeDialog } from "./RequestTypeDialog";
import { WorkflowConfigDialog } from "./workflow/WorkflowConfigDialog";

export const AdminWorkflows = () => {
  const queryClient = useQueryClient();
  const [showRequestTypeDialog, setShowRequestTypeDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | null>(null);

  const { data: requestTypes, isLoading: typesLoading } = useQuery({
    queryKey: ["requestTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("request_types")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as RequestType[];
    }
  });

  const handleAddRequestType = () => {
    setSelectedRequestType(null);
    setShowRequestTypeDialog(true);
  };

  const handleEditRequestType = (requestType: RequestType) => {
    setSelectedRequestType(requestType);
    setShowRequestTypeDialog(true);
  };
  
  const handleConfigureWorkflow = (requestType: RequestType) => {
    setSelectedRequestType(requestType);
    setShowWorkflowDialog(true);
  };

  const handleRequestTypeCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["requestTypes"] });
  };
  
  const handleWorkflowSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["requestTypes"] });
    toast.success("تم حفظ خطوات سير العمل بنجاح");
  };

  const deleteRequestType = useMutation({
    mutationFn: async (typeId: string) => {
      // First check if there are any workflows using this request type
      const { data: relatedWorkflows, error: checkError } = await supabase
        .from("request_workflows")
        .select("id")
        .eq("request_type_id", typeId);
      
      if (checkError) throw checkError;
      
      if (relatedWorkflows && relatedWorkflows.length > 0) {
        throw new Error("لا يمكن حذف نوع الطلب لأنه مرتبط بمسارات عمل");
      }
      
      const { error } = await supabase
        .from("request_types")
        .delete()
        .eq("id", typeId);
      
      if (error) throw error;
      return typeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requestTypes"] });
      toast.success("تم حذف نوع الطلب بنجاح");
    },
    onError: (error) => {
      console.error("Error deleting request type:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("حدث خطأ أثناء حذف نوع الطلب");
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">إدارة أنواع الطلبات</h2>
        <Button onClick={handleAddRequestType}>
          <Plus className="mr-2 h-4 w-4" />
          إضافة نوع طلب جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>أنواع الطلبات</CardTitle>
          <CardDescription>إدارة أنواع الطلبات ونماذج البيانات وخطوات سير العمل المرتبطة بها</CardDescription>
        </CardHeader>
        <CardContent>
          {typesLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : requestTypes && requestTypes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم نوع الطلب</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>عدد الحقول</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>{type.name}</TableCell>
                    <TableCell>{type.description || "لا يوجد وصف"}</TableCell>
                    <TableCell>{type.form_schema.fields?.length || 0}</TableCell>
                    <TableCell>
                      {type.is_active ? "نشط" : "غير نشط"}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleConfigureWorkflow(type)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditRequestType(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500"
                          onClick={() => deleteRequestType.mutate(type.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                لا توجد أنواع طلبات مسجلة
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <RequestTypeDialog
        isOpen={showRequestTypeDialog}
        onClose={() => setShowRequestTypeDialog(false)}
        onRequestTypeCreated={handleRequestTypeCreated}
        requestType={selectedRequestType}
      />
      
      {selectedRequestType && (
        <WorkflowConfigDialog
          isOpen={showWorkflowDialog}
          onClose={() => setShowWorkflowDialog(false)}
          requestTypeId={selectedRequestType.id}
          requestTypeName={selectedRequestType.name}
          workflowId={selectedRequestType.default_workflow_id || null}
          onWorkflowSaved={handleWorkflowSaved}
        />
      )}
    </div>
  );
};
