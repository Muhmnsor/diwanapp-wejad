
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";

export const useUserName = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['current-user-name', user?.id],
    queryFn: async () => {
      try {
        console.log("جاري جلب اسم المستخدم للمعرف:", user?.id);
        
        if (!user?.id) {
          console.log("لا يوجد معرف مستخدم متاح");
          return "المستخدم";
        }
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("خطأ في جلب الملف الشخصي:", error);
          return user?.email?.split('@')[0] || "المستخدم";
        }
        
        console.log("تم جلب بيانات الملف الشخصي:", profile);
        
        // Check if display_name is null, empty, or the same as email
        if (!profile?.display_name || 
            profile.display_name.trim() === "" || 
            profile.display_name === profile.email || 
            profile.display_name.includes('@')) {
          // Use the portion of email before @ as fallback
          return user?.email?.split('@')[0] || "المستخدم";
        } else {
          return profile.display_name;
        }
      } catch (error) {
        console.error("خطأ غير متوقع أثناء جلب اسم المستخدم:", error);
        return user?.email?.split('@')[0] || "المستخدم";
      }
    },
    staleTime: 30000,
    enabled: !!user
  });
};
