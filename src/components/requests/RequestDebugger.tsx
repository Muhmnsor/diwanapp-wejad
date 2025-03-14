
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { validateWorkflow, validateAndRepairRequest, repairAllRequestWorkflows, repairWorkflow } from './utils/workflowValidator';
import { deleteRequestType } from './utils/workflowHelpers';
import { toast } from 'sonner';

interface RequestDebuggerProps {
  enableRepair?: boolean;
}

/**
 * RequestDebugger component for monitoring request operations in development
 * This component doesn't render anything to the DOM but adds listeners for debugging
 * and provides repair functionality for workflow issues
 */
export const RequestDebugger = ({ enableRepair = false }: RequestDebuggerProps) => {
  const [isRepairing, setIsRepairing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any[]>([]);

  useEffect(() => {
    console.log('🛠️ Request Debugger activated');
    
    if (enableRepair) {
      console.log('🔧 Auto-repair functionality is enabled');
    }
    
    // Monitor workflow_operation_logs table for new entries
    const logsChannel = supabase
      .channel('workflow-logs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'workflow_operation_logs'
      }, (payload) => {
        console.log('📝 New workflow operation log:', payload.new);
        
        // Add to debug info
        setDebugInfo(prev => [...prev, {
          type: 'log',
          operation: payload.new.operation_type,
          timestamp: new Date().toISOString(),
          data: payload.new
        }]);
      })
      .subscribe();
    
    // Set up a subscription to requests table changes
    const requestsChannel = supabase
      .channel('requests-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'requests'
      }, async (payload) => {
        console.log('📣 Request change detected:', payload.eventType);
        console.log('📊 Request data:', payload.new);
        
        // Add to debug info
        setDebugInfo(prev => [...prev, {
          type: 'request',
          event: payload.eventType,
          timestamp: new Date().toISOString(),
          data: payload.new
        }]);
        
        // If a new request was created
        if (payload.eventType === 'INSERT') {
          const newRequest = payload.new;
          
          // Log workflow information if present
          if (newRequest.workflow_id) {
            console.log('🔄 Request has workflow_id:', newRequest.workflow_id);
            console.log('⏱️ Current step ID:', newRequest.current_step_id);
            
            // Validate the request's workflow setup
            if (enableRepair && !newRequest.current_step_id) {
              console.log('⚠️ New request is missing current_step_id, attempting repair...');
              
              try {
                const validationResult = await validateAndRepairRequest(newRequest.id);
                if (validationResult.repaired) {
                  console.log('✅ Request repaired successfully:', validationResult.repairMessage);
                } else if (!validationResult.valid) {
                  console.error('❌ Request validation failed:', validationResult.error);
                }
              } catch (error) {
                console.error('❌ Error during request repair:', error);
              }
            }
          }
        }
        
        // If a request was updated
        if (payload.eventType === 'UPDATE') {
          // Check if workflow_id or current_step_id was changed
          if (payload.old.workflow_id !== payload.new.workflow_id || 
              payload.old.current_step_id !== payload.new.current_step_id) {
            console.log('🔄 Request workflow state changed:');
            console.log(`  From workflow: ${payload.old.workflow_id} → ${payload.new.workflow_id}`);
            console.log(`  From step: ${payload.old.current_step_id} → ${payload.new.current_step_id}`);
            
            // If new state doesn't have a current step but has a workflow, that's potentially an issue
            if (enableRepair && payload.new.workflow_id && !payload.new.current_step_id) {
              console.log('⚠️ Request updated with workflow but missing step, attempting repair...');
              
              try {
                const validationResult = await validateAndRepairRequest(payload.new.id);
                if (validationResult.repaired) {
                  console.log('✅ Request repaired successfully:', validationResult.repairMessage);
                } else if (!validationResult.valid) {
                  console.error('❌ Request validation failed:', validationResult.error);
                }
              } catch (error) {
                console.error('❌ Error during request repair:', error);
              }
            }
          }
        }
      })
      .subscribe();
    
    // Clean up on unmount
    return () => {
      supabase.removeChannel(logsChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [enableRepair]);

  // Expose debugging commands to the console
  useEffect(() => {
    if (!window) return;
    
    // Add debug utilities to window object
    (window as any).workflowDebug = {
      // Validate a workflow
      validateWorkflow: async (workflowId: string) => {
        console.log(`🔍 Validating workflow ${workflowId}...`);
        const result = await validateWorkflow(workflowId);
        console.log('Validation result:', result);
        return result;
      },
      
      // Validate a request
      validateRequest: async (requestId: string) => {
        console.log(`🔍 Validating request ${requestId}...`);
        const result = await validateAndRepairRequest(requestId);
        console.log('Validation result:', result);
        return result;
      },
      
      // Repair a specific request
      repairRequest: async (requestId: string) => {
        console.log(`🔧 Repairing request ${requestId}...`);
        const result = await validateAndRepairRequest(requestId);
        console.log('Repair result:', result);
        return result;
      },
      
      // Repair all requests with workflow issues
      repairAllRequests: async () => {
        console.log('🔧 Repairing all requests with workflow issues...');
        setIsRepairing(true);
        try {
          const result = await repairAllRequestWorkflows();
          console.log('Repair result:', result);
          return result;
        } finally {
          setIsRepairing(false);
        }
      },
      
      // Repair a specific workflow
      repairWorkflow: async (workflowId: string) => {
        console.log(`🔧 Repairing workflow ${workflowId}...`);
        setIsRepairing(true);
        try {
          const result = await repairWorkflow(workflowId);
          console.log('Repair result:', result);
          return result;
        } finally {
          setIsRepairing(false);
        }
      },
      
      // Get debug info
      getDebugInfo: () => {
        return debugInfo;
      },
      
      // Delete a request type
      deleteRequestType: async (requestTypeId: string) => {
        console.log(`🗑️ Deleting request type ${requestTypeId}...`);
        try {
          const result = await deleteRequestType(requestTypeId);
          console.log('Deletion result:', result);
          return result;
        } catch (error) {
          console.error('❌ Error during request type deletion:', error);
          return { success: false, error };
        }
      }
    };
    
    console.log('🛠️ Workflow debug utilities added to window.workflowDebug');
    console.log('Available commands:');
    console.log('  workflowDebug.validateWorkflow(workflowId)');
    console.log('  workflowDebug.validateRequest(requestId)');
    console.log('  workflowDebug.repairRequest(requestId)');
    console.log('  workflowDebug.repairAllRequests()');
    console.log('  workflowDebug.repairWorkflow(workflowId)');
    console.log('  workflowDebug.getDebugInfo()');
    console.log('  workflowDebug.deleteRequestType(requestTypeId)');
    
    return () => {
      // Clean up
      delete (window as any).workflowDebug;
    };
  }, [debugInfo]);

  // This component doesn't render anything
  return null;
};
