import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash } from "lucide-react";

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
      toast.success(editingTemplate ? "تم تحديث القالب بنجاح" : "تم إضافة القالب بنجاح");
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>اسم القالب</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسم القالب"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label>محتوى الرسالة</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="أدخل محتوى الرسالة"
                  rows={5}
                  className="text-right"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingTemplate ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">اسم القالب</TableHead>
            <TableHead className="text-right">محتوى الرسالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates?.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="text-right">{template.name}</TableCell>
              <TableCell className="text-right max-w-md truncate">{template.content}</TableCell>
              <TableCell className="text-right">
                <div className="flex space-x-2 justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(template)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      if (window.confirm("هل أنت متأكد من حذف هذا القالب؟")) {
                        deleteMutation.mutate(template.id);
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};