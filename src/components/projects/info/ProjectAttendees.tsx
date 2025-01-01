import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProjectAttendeesProps {
  projectId?: string;
  maxAttendees: number;
}

export const ProjectAttendees = ({ projectId, maxAttendees }: ProjectAttendeesProps) => {
  const { data: registrations = [] } = useQuery({
    queryKey: ['project-registrations', projectId],
    queryFn: async () => {
      if (!projectId) {
        console.error('No projectId provided to ProjectAttendees');
        return [];
      }
      
      console.log('Fetching registrations for project:', projectId);
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching registrations:', error);
        throw error;
      }

      console.log('Fetched registrations:', data);
      return data || [];
    },
    enabled: Boolean(projectId)
  });

  const actualAttendees = registrations?.length || 0;
  console.log('Actual attendees count:', actualAttendees);

  return (
    <div className="flex items-center gap-2 text-gray-600">
      <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
        <Users className="w-5 h-5 text-primary" />
      </div>
      <span dir="rtl">{actualAttendees} من {maxAttendees} مشارك</span>
    </div>
  );
};