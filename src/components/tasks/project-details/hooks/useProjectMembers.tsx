
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectMember {
  id: string;
  name?: string;
  email?: string;
}

export const useProjectMembers = (projectId?: string) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // استعلام عن المستخدمين المرتبطين بالمشروع مباشرة
        // هنا يمكن أن تحتاج لتعديل الاستعلام حسب هيكل قاعدة البيانات
        const { data, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) throw error;

        // تحويل البيانات إلى الشكل المطلوب
        const formattedMembers = data.map((user: any) => ({
          id: user.id,
          name: user.display_name,
          email: user.email
        }));

        setMembers(formattedMembers);
      } catch (error) {
        console.error("Error fetching project members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  return { members, isLoading };
};
