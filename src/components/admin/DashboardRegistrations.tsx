import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRegistrationsQuery } from "./registrations/hooks/useRegistrationsQuery";
import { LoadingState } from "./registrations/components/LoadingState";
import { ErrorState } from "./registrations/components/ErrorState";
import { RegistrationsContent } from "./registrations/components/RegistrationsContent";

export const DashboardRegistrations = ({ eventId }: { eventId: string }) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const { data, isLoading, error, refetch } = useRegistrationsQuery(eventId);

  useEffect(() => {
    if (data) {
      setRegistrations(data);
    }
  }, [data]);

  const handleDeleteRegistration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRegistrations(prev => prev.filter(reg => reg.id !== id));
      await refetch();
    } catch (err) {
      console.error('Error deleting registration:', err);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <RegistrationsContent 
      registrations={registrations}
      onDeleteRegistration={handleDeleteRegistration}
    />
  );
};