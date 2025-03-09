
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { RequestWorkflow, RequestType } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowDialog } from "./WorkflowDialog";

export const AdminWorkflows = () => {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);

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

  const { data: workflows, isLoading: workflowsLoading } = useQuery({
    queryKey: ["workflows", selectedType],
    queryFn: async () => {
      let query = supabase
        .from("request_workflows")
        .select("*")
        .order("name");

      if (selectedType) {
        query = query.eq("request_type_id", selectedType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as RequestWorkflow[];
    },
    enabled: true
  });

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
  };

  const handleAddWorkflow = () => {
    setShowWorkflowDialog(true);
  };

  const handleWorkflowCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["workflows"] });
  };

  const deleteWorkflow = useMutation({
    mutationFn: async (workflowId: string) => {
      const { error } = await supabase
        .from("request_workflows")
        .delete()
        .eq("id", workflowId);
      
      if (error) throw error;
      return workflowId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("تم حذف مسار العمل بنجاح");
    },
    onError: (error) => {
      console.error("Error deleting workflow:", error);
      toast.error("حدث خطأ أثناء حذف مسار العمل");
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">إدارة مسارات العمل</h2>
        <Button onClick={handleAddWorkflow}>
          <Plus className="mr-2 h-4 w-4" />
          إضافة مسار عمل جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>أنواع الطلبات</CardTitle>
              <CardDescription>
                اختر نوع الطلب لعرض مسارات العمل المرتبطة به
              </CardDescription>
            </CardHeader>
            <CardContent>
              {typesLoading ? (
                <>
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-10 w-full" />
                </>
              ) : (
                <div className="space-y-2">
                  {requestTypes?.map((type) => (
                    <Button
                      key={type.id}
                      variant={type.id === selectedType ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleSelectType(type.id)}
                    >
                      {type.name}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>مسارات العمل</CardTitle>
              <CardDescription>
                {selectedType
                  ? `مسارات العمل المرتبطة بنوع الطلب المحدد`
                  : "جميع مسارات العمل"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workflowsLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : workflows && workflows.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم المسار</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflows.map((workflow) => (
                      <TableRow key={workflow.id}>
                        <TableCell>{workflow.name}</TableCell>
                        <TableCell>{workflow.description || "لا يوجد وصف"}</TableCell>
                        <TableCell>
                          {workflow.is_active ? "نشط" : "غير نشط"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                              onClick={() => deleteWorkflow.mutate(workflow.id)}
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
                    {selectedType
                      ? "لا توجد مسارات عمل مرتبطة بنوع الطلب المحدد"
                      : "لا توجد مسارات عمل"}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end">
              {selectedType && (
                <Button 
                  variant="outline"
                  onClick={handleAddWorkflow}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  إضافة مسار عمل لهذا النوع
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      <WorkflowDialog
        isOpen={showWorkflowDialog}
        onClose={() => setShowWorkflowDialog(false)}
        selectedTypeId={selectedType}
        onWorkflowCreated={handleWorkflowCreated}
      />
    </div>
  );
};
