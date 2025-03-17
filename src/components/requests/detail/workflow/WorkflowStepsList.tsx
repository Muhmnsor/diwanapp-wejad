
import { CheckCircle, Circle, UserIcon } from "lucide-react";
import { WorkflowStep } from "../../types";
import { cn } from "@/lib/utils";

interface WorkflowStepsListProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  isCompleted?: boolean;
}

export const WorkflowStepsList = ({ 
  steps, 
  currentStepIndex,
  isCompleted = false
}: WorkflowStepsListProps) => {
  // Group steps by their order
  const stepsByOrder: Record<number, WorkflowStep[]> = {};
  steps.forEach(step => {
    const order = step.step_order || 0;
    if (!stepsByOrder[order]) {
      stepsByOrder[order] = [];
    }
    stepsByOrder[order].push(step);
  });
  
  // Get unique orders and sort them
  const orders = Object.keys(stepsByOrder).map(k => parseInt(k)).sort((a, b) => a - b);
  
  // Find the unique step order at current index
  const currentOrder = currentStepIndex >= 0 && currentStepIndex < orders.length 
    ? orders[currentStepIndex] 
    : -1;
  
  return (
    <ol className="relative border-r border-gray-200 space-y-6">
      {orders.map((order, index) => {
        const stepsAtThisOrder = stepsByOrder[order];
        const isCurrentStep = order === currentOrder;
        const isPastStep = index < currentStepIndex;
        const isFutureStep = index > currentStepIndex;
        
        // Check if this is the last step and the request is completed
        const isLastStepCompleted = isCompleted && index === orders.length - 1;
        
        return (
          <li key={order} className="mb-6 mr-4">
            <div className={cn(
              "absolute w-4 h-4 rounded-full -right-2 border",
              isCurrentStep && !isCompleted 
                ? "bg-primary border-primary" 
                : isPastStep || isLastStepCompleted 
                  ? "bg-green-500 border-green-500" 
                  : "bg-gray-200 border-gray-200"
            )}>
              {(isPastStep || isLastStepCompleted) && (
                <CheckCircle className="w-4 h-4 text-white" />
              )}
              {isCurrentStep && !isCompleted && (
                <Circle className="w-4 h-4 text-primary animate-pulse" />
              )}
            </div>
            
            <div className={cn(
              "pr-6 pb-6",
              isCurrentStep && !isCompleted && "bg-primary/5 border border-primary/10 rounded-lg p-3"
            )}>
              <div className="font-semibold mb-2">
                {/* Use the name of the first step at this order as the label */}
                {stepsAtThisOrder[0]?.step_name || `خطوة ${index + 1}`}
              </div>
              
              {/* Show list of approvers if multiple steps at this order */}
              {stepsAtThisOrder.length > 0 && (
                <div className="space-y-2">
                  {stepsAtThisOrder.map(step => (
                    <div 
                      key={step.id} 
                      className="flex items-center text-sm text-muted-foreground"
                    >
                      <UserIcon className="h-3 w-3 mr-1" />
                      <span className="ml-1">
                        {step.step_type === 'decision' ? 'موافقة' : 'رأي'}:
                      </span>
                      <span className="font-medium mx-1">
                        {step.approver?.display_name || step.approver?.email || 'غير محدد'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
