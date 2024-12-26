import { useEffect, useState } from "react";
import { RegistrationsTable } from "./RegistrationsTable";
import { ExportButton } from "./ExportButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DashboardRegistrations = ({ eventId }: { eventId: string }) => {
  const [registrations, setRegistrations] = useState<any[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching registrations:', error);
        throw error;
      }

      return data || [];
    }
  });

  useEffect(() => {
    if (data) {
      setRegistrations(data);
      console.log('Registrations data:', data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        حدث خطأ في تحميل التسجيلات
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#1A1F2C]">التسجيلات</h2>
        <ExportButton data={registrations} filename="registrations" />
      </div>
      
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <RegistrationsTable 
          registrations={registrations} 
          onDeleteRegistration={(id) => {
            setRegistrations(registrations.filter(reg => reg.id !== id));
          }} 
        />
      </div>
    </div>
  );
};