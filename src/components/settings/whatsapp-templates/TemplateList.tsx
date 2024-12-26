import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TemplatesTable } from "./TemplatesTable";

interface Template {
  id: string;
  name: string;
  content: string;
}

interface TemplateListProps {
  onEdit: (template: Template) => void;
}

export const TemplateList = ({ onEdit }: TemplateListProps) => {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("whatsapp_templates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast.success("تم حذف القالب بنجاح");
    },
    onError: (error) => {
      console.error("Error deleting template:", error);
      toast.error("حدث خطأ أثناء حذف القالب");
    },
  });

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <TemplatesTable
      templates={templates}
      onEdit={onEdit}
      onDelete={(id) => deleteMutation.mutate(id)}
    />
  );
};