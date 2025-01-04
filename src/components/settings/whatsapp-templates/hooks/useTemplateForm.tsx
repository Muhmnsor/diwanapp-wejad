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

  // Optimized query with proper caching
  const { data: templates, error } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: async () => {
      console.log('🔄 Fetching WhatsApp templates...');
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching templates:', error);
        throw error;
      }
      
      console.log('✅ Templates fetched successfully:', data?.length);
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2
  });

  // Optimized mutation with proper error handling
  const mutation = useMutation({
    mutationFn: async (newTemplate: {
      name: string;
      content: string;
      template_type: string;
      notification_type: string;
      target_type: string;
    }) => {
      setIsLoading(true);
      console.log('💾 Saving template:', newTemplate);
      
      try {
        if (editingTemplate?.id) {
          const { error } = await supabase
            .from("whatsapp_templates")
            .update(newTemplate)
            .eq("id", editingTemplate.id);
          if (error) throw error;
          console.log('✅ Template updated successfully');
        } else {
          const { error } = await supabase
            .from("whatsapp_templates")
            .insert([newTemplate]);
          if (error) throw error;
          console.log('✅ Template created successfully');
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
      console.error("❌ Error saving template:", error);
      toast.error("حدث خطأ أثناء حفظ القالب");
    },
  });

  // Optimized delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      console.log('🗑️ Deleting template:', templateId);
      const { error } = await supabase
        .from('whatsapp_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
      console.log('✅ Template deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
      toast.success('تم حذف القالب بنجاح');
    },
    onError: (error) => {
      console.error('❌ Error deleting template:', error);
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
    console.log('✏️ Editing template:', template);
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
    console.log('🔄 Resetting form state');
    setIsOpen(false);
    setEditingTemplate(null);
    setName("");
    setContent("");
    setTemplateType("custom");
    setNotificationType("event_registration");
    setTargetType("event");
  };

  const handlePreview = () => {
    console.log("👁️ Preview template:", { name, content });
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