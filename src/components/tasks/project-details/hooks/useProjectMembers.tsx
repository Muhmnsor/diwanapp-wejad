
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProjectMember } from "../types/projectMember";

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
            id: profileData?.id || user.id,
            user_id: user.id,
            user_display_name: profileData?.display_name || profileData?.email || user.email,
            user_email: profileData?.email || user.email,
            role: "member"
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
                id: admin.user_id,
                user_id: admin.user_id,
                user_display_name: adminProfile?.display_name || adminProfile?.email || 'Admin User',
                user_email: adminProfile?.email,
                role: "admin"
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
