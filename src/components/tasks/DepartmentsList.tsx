import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DepartmentCard } from "./DepartmentCard";
import { CreateDepartmentDialog } from "./departments/CreateDepartmentDialog";
import { EmptyDepartments } from "./departments/EmptyDepartments";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

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

  const handleClearDepartments = async () => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .neq('id', ''); // Delete all records

      if (error) {
        console.error('Error clearing departments:', error);
        toast.error("حدث خطأ أثناء حذف الإدارات");
        return;
      }

      toast.success("تم حذف جميع الإدارات بنجاح");
      refetch();
    } catch (error) {
      console.error('Error:', error);
      toast.error("حدث خطأ أثناء حذف الإدارات");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button 
          variant="destructive" 
          onClick={handleClearDepartments}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          حذف جميع الإدارات
        </Button>
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