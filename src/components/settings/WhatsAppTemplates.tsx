import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TemplateDialog } from "./whatsapp-templates/TemplateDialog";
import { TemplateList } from "./whatsapp-templates/TemplateList";
import { useTemplateForm } from "./whatsapp-templates/hooks/useTemplateForm";

export const WhatsAppTemplates = () => {
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingTemplate,
    setEditingTemplate,
    handleSubmit,
    handleDelete
  } = useTemplateForm();

  return (
    <div className="space-y-6">
      <TemplateList
        templates={templates || []}
        isLoading={isLoading}
        error={error}
        onEdit={setEditingTemplate}
        onDelete={handleDelete}
      />

      <TemplateDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTemplate(null);
        }}
        onSubmit={handleSubmit}
        template={editingTemplate}
      />
    </div>
  );
};