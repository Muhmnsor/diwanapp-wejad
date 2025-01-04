import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TemplatesTable } from "./TemplatesTable";
import { useTemplateDelete } from "./hooks/useTemplateDelete";

interface Template {
  id: string;
  name: string;
  content: string;
}

interface TemplateListProps {
  onEdit: (template: Template) => void;
}

export const TemplateList = ({ onEdit }: TemplateListProps) => {
  const { handleDelete } = useTemplateDelete();

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

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <TemplatesTable
      templates={templates}
      onEdit={onEdit}
      onDelete={handleDelete}
    />
  );
};