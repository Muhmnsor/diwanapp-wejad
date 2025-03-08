
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          return;
        }
        
        // Check if user has admin role
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role_id, roles(name)')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          return;
        }
        
        // Check if any of the roles is admin or app_admin
        const isAdminRole = roles?.some((role: any) => 
          role.roles?.name === 'admin' || role.roles?.name === 'app_admin'
        );
        
        setIsAdmin(isAdminRole || false);
      } catch (error) {
        console.error('Error in useIsAdmin hook:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  return isAdmin;
};
