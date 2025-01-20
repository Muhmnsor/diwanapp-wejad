import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRegistrationsQuery } from "./registrations/hooks/useRegistrationsQuery";
import { LoadingState } from "./registrations/components/LoadingState";
import { ErrorState } from "./registrations/components/ErrorState";
import { RegistrationsContent } from "./registrations/components/RegistrationsContent";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export const DashboardRegistrations = ({ eventId }: { eventId: string }) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const { user, isAuthenticated } = useAuthStore();
  const { data, isLoading, error, refetch } = useRegistrationsQuery(eventId);

  useEffect(() => {
    console.log("DashboardRegistrations - Auth state:", { isAuthenticated, user });
    if (!isAuthenticated) {
      console.log("User not authenticated");
      return;
    }

    if (data) {
      console.log("Setting registrations data:", data);
      setRegistrations(data);
    }
  }, [data, isAuthenticated, user]);

  const handleDeleteRegistration = async (id: string) => {
    try {
      if (!isAuthenticated) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      console.log("Deleting registration:", id);
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting registration:', error);
        toast.error('حدث خطأ في حذف التسجيل');
        throw error;
      }

      setRegistrations(prev => prev.filter(reg => reg.id !== id));
      await refetch();
      toast.success('تم حذف التسجيل بنجاح');
    } catch (err) {
      console.error('Error in delete operation:', err);
      toast.error('حدث خطأ في حذف التسجيل');
    }
  };

  if (!isAuthenticated) {
    return <ErrorState error={new Error("يجب تسجيل الدخول لعرض التسجيلات")} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    console.error("Error fetching registrations:", error);
    return <ErrorState error={error} />;
  }

  return (
    <RegistrationsContent 
      registrations={registrations}
      onDeleteRegistration={handleDeleteRegistration}
    />
  );
};