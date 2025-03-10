
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";
import { RequestType } from "./types";
import { WorkflowStepsConfig } from "./WorkflowStepsConfig";
import { FormFieldEditor } from "./form/FormFieldEditor";
import { FormFieldsList } from "./form/FormFieldsList";
import { RequestTypeForm } from "./form/RequestTypeForm";
import { useRequestTypeForm } from "./form/useRequestTypeForm";
import { ErrorBoundary } from "react-error-boundary";

interface RequestTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestTypeCreated: () => void;
  requestType?: RequestType | null;
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  console.error("Error in RequestTypeDialog:", error);
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        حدث خطأ في النموذج: {error.message}
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetErrorBoundary}
          >
            إعادة المحاولة
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export const RequestTypeDialog = ({
  isOpen,
  onClose,
  onRequestTypeCreated,
  requestType = null,
}: RequestTypeDialogProps) => {
  console.log("RequestTypeDialog render with isOpen:", isOpen, "requestType:", requestType?.id);
  
  const {
    form,
    formFields,
    currentField,
    editingFieldIndex,
    workflowSteps,
    createdRequestTypeId,
    isLoading,
    formError,
    isEditing,
    setCurrentField,
    setFormError,
    handleAddField,
    handleRemoveField,
    handleEditField,
    handleWorkflowStepsUpdated,
    onSubmit,
    resetForm
  } = useRequestTypeForm({
    requestType,
    onRequestTypeCreated,
    onClose
  });
  
  // Prevent accidental closure of dialog when clicking on modal content
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleCloseDialog = () => {
    if (isLoading) {
      toast.warning("الرجاء الانتظار حتى اكتمال العملية الحالية");
      return;
    }
    
    // Use setTimeout to ensure React state updates properly
    setTimeout(() => {
      resetForm();
      onClose();
    }, 0);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) handleCloseDialog();
      }}
    >
      <DialogContent 
        className="max-w-4xl rtl max-h-[95vh] overflow-hidden flex flex-col" 
        dir="rtl"
        onClick={handleDialogClick}
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "تعديل نوع الطلب" : "إضافة نوع طلب جديد"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "عدّل بيانات نوع الطلب وحقول النموذج وخطوات سير العمل" : "أنشئ نوع طلب جديد وحدد حقول النموذج المطلوبة وخطوات سير العمل"}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <ErrorBoundary 
          FallbackComponent={ErrorFallback}
          onReset={resetForm}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col overflow-hidden">
              <RequestTypeForm form={form} />

              <div className="flex-1 overflow-hidden space-y-6">
                <ScrollArea className="h-[calc(65vh-220px)]">
                  <div className="px-1 space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">حقول النموذج</h3>
                      </div>
                      <Separator />

                      <FormFieldEditor
                        currentField={currentField}
                        editingFieldIndex={editingFieldIndex}
                        setCurrentField={setCurrentField}
                        handleAddField={handleAddField}
                      />

                      <FormFieldsList
                        formFields={formFields}
                        handleEditField={handleEditField}
                        handleRemoveField={handleRemoveField}
                      />
                    </div>

                    <WorkflowStepsConfig 
                      requestTypeId={createdRequestTypeId}
                      onWorkflowStepsUpdated={handleWorkflowStepsUpdated}
                      initialSteps={workflowSteps}
                    />
                  </div>
                </ScrollArea>
              </div>

              <DialogFooter className="mt-4 flex-row-reverse sm:justify-start">
                <Button type="submit" disabled={isLoading}>
                  {isLoading 
                    ? (isEditing ? "جارٍ التحديث..." : "جارٍ الإنشاء...") 
                    : (isEditing ? "تحديث نوع الطلب" : "إنشاء نوع الطلب")
                  }
                </Button>
                <Button variant="outline" type="button" onClick={handleCloseDialog}>
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};
