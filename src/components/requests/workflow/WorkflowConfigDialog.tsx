
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WorkflowStepsConfig } from "../WorkflowStepsConfig";
import { WorkflowStep } from "../types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface WorkflowConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestTypeId: string;
  requestTypeName: string;
  workflowId?: string | null;
  onWorkflowSaved?: () => void;
}

export const WorkflowConfigDialog = ({ 
  isOpen, 
  onClose, 
  requestTypeId,
  requestTypeName,
  workflowId = null,
  onWorkflowSaved
}: WorkflowConfigDialogProps) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch existing workflow steps if editing
  const { data: initialSteps, isLoading, error: fetchError } = useQuery({
    queryKey: ["workflowSteps", workflowId, requestTypeId],
    queryFn: async () => {
      if (!workflowId) return [];
      
      try {
        const { data, error } = await supabase
          .from("workflow_steps")
          .select("*")
          .eq("workflow_id", workflowId)
          .order("step_order", { ascending: true });
          
        if (error) throw error;
        
        console.log("Fetched workflow steps:", data);
        return data as WorkflowStep[];
      } catch (error) {
        console.error("Error fetching workflow steps:", error);
        setError(`فشل في جلب خطوات سير العمل: ${error.message}`);
        return [];
      }
    },
    enabled: !!workflowId && isOpen
  });
  
  // Set the initial steps when they're loaded
  useEffect(() => {
    if (initialSteps && initialSteps.length > 0) {
      console.log("Setting initial steps:", initialSteps);
      setWorkflowSteps(initialSteps);
    }
  }, [initialSteps]);
  
  // Set error if fetch fails
  useEffect(() => {
    if (fetchError) {
      setError(`فشل في جلب خطوات سير العمل: ${fetchError.message}`);
    }
  }, [fetchError]);
  
  const handleWorkflowStepsUpdated = (steps: WorkflowStep[]) => {
    console.log("Workflow steps updated in dialog:", steps);
    setWorkflowSteps(steps);
  };
  
  const handleWorkflowSaved = () => {
    console.log("Workflow saved successfully");
    if (onWorkflowSaved) {
      onWorkflowSaved();
    }
    toast.success("تم حفظ خطوات سير العمل بنجاح");
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl rtl max-h-[95vh] overflow-hidden flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle>إعداد خطوات سير العمل</DialogTitle>
          <DialogDescription>
            تكوين خطوات سير العمل لنوع الطلب: {requestTypeName}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">جاري تحميل خطوات سير العمل...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto py-4">
            <WorkflowStepsConfig
              requestTypeId={requestTypeId}
              workflowId={workflowId}
              initialSteps={initialSteps || []}
              onWorkflowStepsUpdated={handleWorkflowStepsUpdated}
              onWorkflowSaved={handleWorkflowSaved}
              standalone={true}
            />
          </div>
        )}
        
        <DialogFooter className="mt-4 flex-row-reverse sm:justify-start">
          <Button variant="outline" type="button" onClick={onClose}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
