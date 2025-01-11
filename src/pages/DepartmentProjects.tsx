import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";

const DepartmentProjects = () => {
  const { id } = useParams();

  const { data: department } = useQuery({
    queryKey: ['department', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-primary mb-8">
          {department?.name} - المشاريع
        </h1>
        
        {/* Project list will be implemented in the next iteration */}
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">قريباً - عرض مشاريع الإدارة</p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DepartmentProjects;