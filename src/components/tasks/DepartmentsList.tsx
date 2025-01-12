import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DepartmentCard } from "./DepartmentCard";
import { CreateDepartmentDialog } from "./departments/CreateDepartmentDialog";
import { EmptyDepartments } from "./departments/EmptyDepartments";

export const DepartmentsList = () => {
  const { data: departments = [], refetch } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching departments:', error);
        throw error;
      }
      return data || [];
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateDepartmentDialog onDepartmentCreated={refetch} />
      </div>

      {departments.length === 0 ? (
        <EmptyDepartments />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <DepartmentCard key={department.id} department={department} />
          ))}
        </div>
      )}
    </div>
  );
};