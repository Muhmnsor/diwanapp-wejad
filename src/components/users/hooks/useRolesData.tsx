
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "../types";

export const useRolesData = () => {
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('جلب الأدوار من قاعدة البيانات...');
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      
      if (error) {
        console.error('خطأ في جلب الأدوار:', error);
        throw error;
      }
      
      console.log('تم جلب الأدوار بنجاح:', data);
      return data;
    }
  });

  return {
    roles,
    isLoading: rolesLoading
  };
};
