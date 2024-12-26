import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TemplateDialog } from "./whatsapp-templates/TemplateDialog";
import { TemplateHeader } from "./whatsapp-templates/TemplateHeader";
import { TemplateList } from "./whatsapp-templates/TemplateList";

export const WhatsAppTemplates = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const mutation = useMutation({
    mutationFn: async (newTemplate: { name: string; content: string }) => {
      if (editingTemplate?.id) {
        const { error } = await supabase
          .from("whatsapp_templates")
          .update(newTemplate)
          .eq("id", editingTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("whatsapp_templates")
          .insert([newTemplate]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast.success(
        editingTemplate ? "تم تحديث القالب بنجاح" : "تم إضافة القالب بنجاح"
      );
      handleClose();
    },
    onError: (error) => {
      console.error("Error saving template:", error);
      toast.error("حدث خطأ أثناء حفظ القالب");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, content });
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setName(template.name);
    setContent(template.content);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingTemplate(null);
    setName("");
    setContent("");
  };

  const handleAddClick = () => {
    setIsOpen(true);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <TemplateHeader onAddClick={handleAddClick} />
      <TemplateDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        name={name}
        content={content}
        onNameChange={setName}
        onContentChange={setContent}
        onSubmit={handleSubmit}
        isEditing={!!editingTemplate}
      />
      <TemplateList onEdit={handleEdit} />
    </div>
  );
};