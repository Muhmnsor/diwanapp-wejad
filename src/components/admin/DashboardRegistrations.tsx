import { useEffect, useState } from "react";
import { RegistrationsTable } from "./RegistrationsTable";
import { ExportButton } from "./ExportButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DashboardRegistrations = ({ eventId }: { eventId: string }) => {
  const [registrations, setRegistrations] = useState<any[]>([]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async () => {
      if (!eventId) {
        console.error('No ID provided');
        return [];
      }

      try {
        // First, check if this is a project by querying the projects table
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id')
          .eq('id', eventId)
          .maybeSingle();

        if (projectError) {
          console.error('Error checking project:', projectError);
          throw projectError;
        }

        console.log('Checking if ID is a project:', projectData);

        // Determine if this is a project or event
        const isProject = !!projectData;
        console.log('Is this a project?', isProject);

        // Query registrations based on whether this is a project or event
        const { data: registrationsData, error: registrationsError } = await supabase
          .from('registrations')
          .select(`
            *,
            event:events!inner(*),
            project:projects!inner(*)
          `)
          .or(
            isProject ? 
            `project_id.eq.${eventId}` :
            `event_id.eq.${eventId}`
          );

        if (registrationsError) {
          console.error('Error fetching registrations:', registrationsError);
          throw registrationsError;
        }

        console.log('Fetched registrations:', registrationsData);
        return registrationsData || [];
      } catch (err) {
        console.error('Error in registration query:', err);
        throw err;
      }
    },
    enabled: !!eventId,
    retry: 1
  });

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
    <div className="space-y-6 bg-white rounded-lg shadow-sm p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#1A1F2C]">التسجيلات</h2>
        <ExportButton data={registrations} filename="registrations" />
      </div>
      
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <RegistrationsTable 
          registrations={registrations} 
          onDeleteRegistration={handleDeleteRegistration}
        />
      </div>
    </div>
  );
};