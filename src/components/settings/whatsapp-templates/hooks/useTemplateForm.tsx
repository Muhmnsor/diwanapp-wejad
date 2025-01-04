import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTemplateForm = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [templateType, setTemplateType] = useState("custom");
  const [notificationType, setNotificationType] = useState("event_registration");
  const [targetType, setTargetType] = useState("event");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch templates
  const { data: templates, error } = useQuery({
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

  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('whatsapp_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
      toast.success('تم حذف القالب بنجاح');
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('حدث خطأ أثناء حذف القالب');
    }
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

  const handleDelete = async (template: any) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      await deleteMutation.mutateAsync(template.id);
    }
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

  const handlePreview = () => {
    console.log("Preview template:", { name, content });
  };

  return {
    isOpen,
    setIsOpen,
    name,
    content,
    templateType,
    notificationType,
    targetType,
    isLoading,
    editingTemplate,
    templates,
    error,
    setName,
    setContent,
    setTemplateType,
    setNotificationType,
    setTargetType,
    handleSubmit,
    handleEdit,
    handleClose,
    handlePreview,
    handleDelete
  };
};