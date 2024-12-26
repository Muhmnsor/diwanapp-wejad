import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { TemplateForm } from "./whatsapp-templates/TemplateForm";
import { TemplatesTable } from "./whatsapp-templates/TemplatesTable";

export const WhatsAppTemplates = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

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

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">قوالب الرسائل</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة قالب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "تعديل قالب" : "إضافة قالب جديد"}
              </DialogTitle>
            </DialogHeader>
            <TemplateForm
              name={name}
              content={content}
              onNameChange={setName}
              onContentChange={setContent}
              onSubmit={handleSubmit}
              isEditing={!!editingTemplate}
            />
          </DialogContent>
        </Dialog>
      </div>

      <TemplatesTable
        templates={templates}
        onEdit={handleEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
};