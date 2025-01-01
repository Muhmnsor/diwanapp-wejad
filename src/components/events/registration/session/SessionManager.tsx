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
    // Only listen for auth state changes, don't enforce login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('Auth state changed:', event);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return <>{children}</>;
};