
import { useEffect } from "react";
import { RequestDebugger } from "./RequestDebugger";
import { toast } from "sonner";

interface RequestsWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component for the requests module
 * Adds global event listeners and debugging tools
 */
export const RequestsWrapper = ({ children }: RequestsWrapperProps) => {
  useEffect(() => {
    // Listen for workflow-related errors
    const handleWorkflowError = (event: ErrorEvent) => {
      const message = event.message || "";
      
      if (
        message.includes("workflow") || 
        message.includes("step") || 
        message.includes("approver")
      ) {
        console.error("Workflow-related error:", event);
        
        // Show a friendly error message to the user
        toast.error("حدث خطأ في مسار سير العمل. يرجى الاتصال بمسؤول النظام.");
      }
    };
    
    window.addEventListener("error", handleWorkflowError);
    
    return () => {
      window.removeEventListener("error", handleWorkflowError);
    };
  }, []);

  return (
    <>
      {children}
      {/* Hidden debugger component that adds logging */}
      {process.env.NODE_ENV !== "production" && <RequestDebugger />}
    </>
  );
};
