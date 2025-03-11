
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * RequestDebugger component for monitoring request operations in development
 * This component doesn't render anything to the DOM but adds listeners for debugging
 */
export const RequestDebugger = () => {
  useEffect(() => {
    console.log('🛠️ Request Debugger activated');
    
    // Set up a subscription to requests table changes
    const channel = supabase
      .channel('requests-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'requests'
      }, (payload) => {
        console.log('📣 Request change detected:', payload.eventType);
        console.log('📊 Request data:', payload.new);
        
        // If a new request was created
        if (payload.eventType === 'INSERT') {
          const newRequest = payload.new;
          // Log workflow information if present
          if (newRequest.workflow_id) {
            console.log('🔄 Request has workflow_id:', newRequest.workflow_id);
            console.log('⏱️ Current step ID:', newRequest.current_step_id);
          }
        }
      })
      .subscribe();

    // Clean up on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // This component doesn't render anything
  return null;
};
