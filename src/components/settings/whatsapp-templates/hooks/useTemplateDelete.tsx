import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTemplateDelete = () => {
  const queryClient = useQueryClient();

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

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا القالب؟")) {
      deleteMutation.mutate(id);
    }
  };

  return { handleDelete };
};