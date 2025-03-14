
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SessionManagerProps {
  children: React.ReactNode;
}

export const SessionManager = ({ children }: SessionManagerProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("EventSessionManager: Setting up auth listener");
    
    // Only listen for auth state changes, don't enforce login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('EventSessionManager: Auth state changed:', event, 'Session:', session ? "exists" : "null");
      
      if (event === 'SIGNED_OUT') {
        console.log('EventSessionManager: User signed out');
      }
    });

    return () => {
      console.log("EventSessionManager: Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, [navigate]);

  return <>{children}</>;
};
