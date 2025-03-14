
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Plus, Edit, Trash2, Settings, Bug } from "lucide-react";
import { RequestType } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestTypeDialog } from "./RequestTypeDialog";
import { WorkflowConfigDialog } from "./workflow/WorkflowConfigDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowDebugPanel } from "./workflow/debug/WorkflowDebugPanel";
import { checkRequestTypeDependencies } from "./utils/workflowHelpers";

export const AdminWorkflows = () => {
  const queryClient = useQueryClient();
  const [showRequestTypeDialog, setShowRequestTypeDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("request-types");
  const [dependencies, setDependencies] = useState<{
    workflows: any[];
    requests: any[];
    hasWorkflows: boolean;
    hasRequests: boolean;
  } | null>(null);

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
  
  const confirmDeleteRequestType = async (requestType: RequestType) => {
    setSelectedRequestType(requestType);
    setDeleteError(null);
    
    try {
      const deps = await checkRequestTypeDependencies(requestType.id);
      setDependencies(deps);
      
      if (deps.hasRequests) {
        setDeleteError(`لا يمكن حذف نوع الطلب لأنه مرتبط بـ ${deps.requests.length} من الطلبات الموجودة.`);
      }
    } catch (error) {
      console.error("Error checking dependencies:", error);
      setDeleteError("حدث خطأ أثناء التحقق من العلاقات المرتبطة بنوع الطلب");
    }
    
    setShowDeleteDialog(true);
  };

  const deleteRequestType = useMutation({
    mutationFn: async (typeId: string) => {
      const { data, error } = await supabase
        .rpc('delete_request_type', { p_request_type_id: typeId });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requestTypes"] });
      setShowDeleteDialog(false);
      toast.success(data.message || "تم حذف نوع الطلب بنجاح");
    },
    onError: (error: any) => {
      console.error("Error deleting request type:", error);
      
      if (error.message) {
        setDeleteError(error.message);
      } else {
        setDeleteError("حدث خطأ أثناء حذف نوع الطلب");
      }
    }
  });

  const handleForceDelete = () => {
    if (selectedRequestType) {
      deleteRequestType.mutate(selectedRequestType.id);
    }
  };

  const toggleDebugPanel = () => {
    setShowDebugPanel(!showDebugPanel);
    if (!showDebugPanel) {
      setActiveTab("debug");
    } else {
      setActiveTab("request-types");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">إدارة أنواع الطلبات</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={toggleDebugPanel} title="عرض سجلات التتبع">
            <Bug className="h-4 w-4 ml-2" />
            {showDebugPanel ? "إخفاء سجلات التتبع" : "عرض سجلات التتبع"}
          </Button>
          <Button onClick={handleAddRequestType}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة نوع طلب جديد
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="request-types">أنواع الطلبات</TabsTrigger>
          {showDebugPanel && <TabsTrigger value="debug">سجلات التتبع</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="request-types">
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
                              onClick={() => confirmDeleteRequestType(type)}
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
        </TabsContent>
        
        {showDebugPanel && (
          <TabsContent value="debug">
            <WorkflowDebugPanel />
          </TabsContent>
        )}
      </Tabs>

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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف نوع الطلب؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف نوع الطلب "{selectedRequestType?.name}" بشكل نهائي.
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {deleteError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          
          {dependencies?.hasWorkflows && !dependencies.hasRequests && (
            <Alert variant="warning" className="mt-4 bg-amber-50 text-amber-800 border-amber-200">
              <AlertDescription>
                هذا النوع مرتبط بـ {dependencies.workflows.length} من مسارات سير العمل.
                سيتم حذف جميع مسارات سير العمل المرتبطة به تلقائياً.
              </AlertDescription>
            </Alert>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteError(null)}>إلغاء</AlertDialogCancel>
            {!dependencies?.hasRequests && (
              <AlertDialogAction
                onClick={handleForceDelete}
                disabled={deleteRequestType.isPending}
                className="bg-red-500 hover:bg-red-600"
              >
                {deleteRequestType.isPending ? "جاري الحذف..." : "حذف"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
