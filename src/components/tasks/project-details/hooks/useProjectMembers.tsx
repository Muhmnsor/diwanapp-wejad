
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectMember {
  user_id: string;
  display_name?: string;
  email?: string;
}

export const useProjectMembers = (projectId?: string) => {
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        // First get current user to always include them in the members list
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user profile info
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, display_name, email')
            .eq('id', user.id)
            .single();
            
          const members: ProjectMember[] = [{
            user_id: user.id,
            display_name: profileData?.display_name || profileData?.email || user.email,
            email: profileData?.email || user.email
          }];
          
          // Get admin users
          const { data: admins } = await supabase
            .from('user_roles')
            .select('user_id, roles(name)')
            .eq('roles.name', 'admin');
            
          if (admins && admins.length > 0) {
            for (const admin of admins) {
              // Skip if already in the list (current user)
              if (members.some(m => m.user_id === admin.user_id)) continue;
              
              // Get admin profile info
              const { data: adminProfile } = await supabase
                .from('profiles')
                .select('display_name, email')
                .eq('id', admin.user_id)
                .single();
                
              members.push({
                user_id: admin.user_id,
                display_name: adminProfile?.display_name || adminProfile?.email || 'Admin User',
                email: adminProfile?.email
              });
            }
          }
          
          // If projectId is provided, get project members
          if (projectId) {
            // TODO: Add project-specific members if implemented
            // This is a placeholder for future implementation
          }
          
          setProjectMembers(members);
        }
      } catch (error) {
        console.error("Error fetching project members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  return { projectMembers, isLoading };
};
