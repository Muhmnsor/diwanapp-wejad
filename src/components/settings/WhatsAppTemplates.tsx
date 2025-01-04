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
  const [templateType, setTemplateType] = useState("custom");
  const [notificationType, setNotificationType] = useState("event_registration");
  const [targetType, setTargetType] = useState("event");
  const [isLoading, setIsLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: async (newTemplate: {
      name: string;
      content: string;
      template_type: string;
      notification_type: string;
      target_type: string;
    }) => {
      setIsLoading(true);
      try {
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
      } finally {
        setIsLoading(false);
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
    mutation.mutate({
      name,
      content,
      template_type: templateType,
      notification_type: notificationType,
      target_type: targetType,
    });
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setName(template.name);
    setContent(template.content);
    setTemplateType(template.template_type);
    setNotificationType(template.notification_type);
    setTargetType(template.target_type);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingTemplate(null);
    setName("");
    setContent("");
    setTemplateType("custom");
    setNotificationType("event_registration");
    setTargetType("event");
  };

  const handleAddClick = () => {
    setIsOpen(true);
  };

  const handlePreview = () => {
    // Preview functionality will be implemented later
    console.log("Preview template:", { name, content });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <TemplateHeader onAddClick={handleAddClick} />
      <TemplateDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        name={name}
        content={content}
        templateType={templateType}
        notificationType={notificationType}
        targetType={targetType}
        onNameChange={setName}
        onContentChange={setContent}
        onTemplateTypeChange={setTemplateType}
        onNotificationTypeChange={setNotificationType}
        onTargetTypeChange={setTargetType}
        onSubmit={handleSubmit}
        onPreview={handlePreview}
        isEditing={!!editingTemplate}
        isLoading={isLoading}
      />
      <TemplateList onEdit={handleEdit} />
    </div>
  );
};