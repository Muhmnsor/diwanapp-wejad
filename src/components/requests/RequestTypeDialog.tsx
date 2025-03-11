
import React, { useState, useEffect } from "react";
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
import { AlertTriangle, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Form } from "@/components/ui/form";
import { RequestType } from "./types";
import { FormFieldEditor } from "./form/FormFieldEditor";
import { FormFieldsList } from "./form/FormFieldsList";
import { RequestTypeForm } from "./form/RequestTypeForm";
import { useRequestTypeForm } from "./form/useRequestTypeForm";
import { WorkflowConfigDialog } from "./workflow/WorkflowConfigDialog";

interface RequestTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestTypeCreated: () => void;
  requestType?: RequestType | null;
}

export const RequestTypeDialog = ({
  isOpen,
  onClose,
  onRequestTypeCreated,
  requestType = null,
}: RequestTypeDialogProps) => {
  const {
    form,
    formFields,
    currentField,
    editingFieldIndex,
    createdRequestTypeId,
    isLoading,
    formError,
    isEditing,
    setCurrentField,
    setFormError,
    handleAddField,
    handleRemoveField,
    handleEditField,
    onSubmit
  } = useRequestTypeForm({
    requestType,
    onRequestTypeCreated,
    onClose
  });
  
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [needsWorkflow, setNeedsWorkflow] = useState(false);
  const [newRequestTypeData, setNewRequestTypeData] = useState<any>(null);

  // Check if a workflow configuration prompt should be shown
  useEffect(() => {
    if (createdRequestTypeId && !requestType?.default_workflow_id) {
      setNeedsWorkflow(true);
      setNewRequestTypeData({
        id: createdRequestTypeId,
        name: form.getValues('name')
      });
    }
  }, [createdRequestTypeId, form, requestType]);

  // Handle workflow dialog close
  const handleWorkflowDialogClose = () => {
    setShowWorkflowDialog(false);
    // Only trigger the final close if not showing the prompt anymore
    if (!needsWorkflow) {
      onClose();
    }
  };

  // Handle workflow saved
  const handleWorkflowSaved = () => {
    setNeedsWorkflow(false);
    setShowWorkflowDialog(false);
    toast.success("تم حفظ إعدادات مسار سير العمل بنجاح");
    onRequestTypeCreated();
    onClose();
  };

  // Handle skip workflow setup
  const handleSkipWorkflow = () => {
    toast.info("لم يتم إعداد مسار سير العمل. يمكنك إعداده لاحقاً من خلال قائمة مسارات سير العمل.");
    setNeedsWorkflow(false);
    onRequestTypeCreated();
    onClose();
  };

  // Show workflow setup prompt if needed
  if (needsWorkflow) {
    return (
      <Dialog open={true} onOpenChange={() => setNeedsWorkflow(false)}>
        <DialogContent className="max-w-lg rtl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إعداد مسار سير العمل</DialogTitle>
            <DialogDescription>
              لإكمال إعداد نوع الطلب، يجب تكوين مسار سير العمل الخاص به
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="my-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              مسار سير العمل يحدد خطوات الموافقة التي يمر بها الطلب والأشخاص المسؤولين عن كل خطوة.
              بدون مسار سير العمل، لن يمكن استخدام نوع الطلب بشكل صحيح.
            </AlertDescription>
          </Alert>
          
          <DialogFooter className="mt-4 flex-row-reverse sm:justify-start gap-2">
            <Button onClick={() => setShowWorkflowDialog(true)}>
              إعداد مسار سير العمل الآن
            </Button>
            <Button variant="outline" onClick={handleSkipWorkflow}>
              تخطي (إعداد لاحقاً)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Show workflow configuration dialog if requested
  if (showWorkflowDialog && newRequestTypeData) {
    return (
      <WorkflowConfigDialog
        isOpen={showWorkflowDialog}
        onClose={handleWorkflowDialogClose}
        requestTypeId={newRequestTypeData.id}
        requestTypeName={newRequestTypeData.name}
        onWorkflowSaved={handleWorkflowSaved}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl rtl max-h-[95vh] overflow-hidden flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "تعديل نوع الطلب" : "إضافة نوع طلب جديد"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "عدّل بيانات نوع الطلب وحقول النموذج" : "أنشئ نوع طلب جديد وحدد حقول النموذج المطلوبة"}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

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
              <Button variant="outline" type="button" onClick={onClose}>
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
