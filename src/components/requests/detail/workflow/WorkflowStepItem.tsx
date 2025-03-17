
import { Check, MessageCircle, AlertTriangle, Clock } from "lucide-react";
import { WorkflowStep } from "../../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WorkflowStepItemProps {
  step: WorkflowStep;
  isCurrent: boolean;
  isCompleted: boolean;
}

export const WorkflowStepItem = ({ step, isCurrent, isCompleted }: WorkflowStepItemProps) => {
  const isOpinionStep = step.step_type === 'opinion';
  
  // Choose the appropriate icon based on step type and status
  const StepIcon = () => {
    if (isCompleted) {
      return <Check className="h-5 w-5 text-white" />;
    }
    
    if (isOpinionStep) {
      return <MessageCircle className="h-5 w-5" />;
    }
    
    if (step.is_required === false) {
      return <AlertTriangle className="h-5 w-5" />;
    }
    
    return <Clock className="h-5 w-5" />;
  };
  
  // Determine the appropriate styling based on step status
  const getStepIconClasses = () => {
    const baseClasses = "flex items-center justify-center rounded-full w-8 h-8";
    
    if (isCompleted) {
      return `${baseClasses} bg-green-600`;
    }
    
    if (isCurrent) {
      if (isOpinionStep) {
        return `${baseClasses} bg-blue-100 text-blue-600 border border-blue-300`;
      }
      return `${baseClasses} bg-orange-100 text-orange-600 border border-orange-300`;
    }
    
    return `${baseClasses} bg-gray-100 text-gray-500 border border-gray-200`;
  };
  
  const getStepTextClasses = () => {
    if (isCompleted) {
      return "text-green-700";
    }
    
    if (isCurrent) {
      if (isOpinionStep) {
        return "text-blue-700 font-medium";
      }
      return "text-orange-700 font-medium";
    }
    
    return "text-gray-500";
  };
  
  const getStepTypeText = () => {
    if (isOpinionStep) {
      return "خطوة إبداء رأي";
    }
    
    if (step.is_required === false) {
      return "خطوة اختيارية";
    }
    
    return "خطوة قرار";
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center mb-3 group">
            <div className={getStepIconClasses()}>
              <StepIcon />
            </div>
            <div className="mr-3 flex-1">
              <div className={`${getStepTextClasses()} text-sm font-medium`}>
                {step.step_name || "خطوة بدون اسم"}
              </div>
              <div className="text-xs text-gray-500">
                {getStepTypeText()}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <div className="text-sm">
            <div className="font-bold mb-1">{step.step_name}</div>
            <div className="text-xs text-gray-500">{getStepTypeText()}</div>
            {step.instructions && (
              <div className="mt-1 text-xs max-w-[200px]">{step.instructions}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
