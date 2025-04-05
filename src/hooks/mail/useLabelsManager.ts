
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Label {
  id: string;
  name: string;
  color: string;
}

export const useLabelsManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // الحصول على التصنيفات المتاحة
  const { data: labels, isLoading: isLoadingLabels } = useQuery({
    queryKey: ['mail-labels'],
    queryFn: async () => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("يجب تسجيل الدخول للوصول إلى التصنيفات");
        }
        
        const { data, error } = await supabase
          .from('internal_message_labels')
          .select('*')
          .eq('user_id', user.data.user.id)
          .order('name');
          
        if (error) throw error;
        
        return data as Label[];
      } catch (err) {
        console.error("Error fetching labels:", err);
        throw err;
      }
    }
  });

  // إضافة تصنيف جديد
  const addLabel = useMutation({
    mutationFn: async (newLabel: { name: string, color: string }) => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("يجب تسجيل الدخول لإضافة تصنيفات");
        }
        
        const { data, error } = await supabase
          .from('internal_message_labels')
          .insert({
            name: newLabel.name,
            color: newLabel.color,
            user_id: user.data.user.id
          })
          .select();
          
        if (error) throw error;
        
        return data[0] as Label;
      } catch (error: any) {
        console.error("Error adding label:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mail-labels'] });
      toast({
        title: "تم الإضافة",
        description: "تم إضافة التصنيف بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "فشلت الإضافة",
        description: error.message || "حدث خطأ أثناء إضافة التصنيف",
        variant: "destructive",
      });
    },
  });

  // حذف تصنيف
  const deleteLabel = useMutation({
    mutationFn: async (labelId: string) => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("يجب تسجيل الدخول لحذف التصنيفات");
        }
        
        // حذف علاقات التصنيف أولاً
        const { error: relationsError } = await supabase
          .from('internal_message_label_relations')
          .delete()
          .eq('label_id', labelId)
          .eq('user_id', user.data.user.id);
          
        if (relationsError) throw relationsError;
        
        // حذف التصنيف نفسه
        const { error } = await supabase
          .from('internal_message_labels')
          .delete()
          .eq('id', labelId)
          .eq('user_id', user.data.user.id);
          
        if (error) throw error;
        
        return { success: true };
      } catch (error: any) {
        console.error("Error deleting label:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mail-labels'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف التصنيف بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "فشل الحذف",
        description: error.message || "حدث خطأ أثناء حذف التصنيف",
        variant: "destructive",
      });
    },
  });

  // إضافة تصنيف لرسالة
  const addLabelToMessage = useMutation({
    mutationFn: async ({ messageId, labelId }: { messageId: string, labelId: string }) => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("يجب تسجيل الدخول لإضافة تصنيف للرسائل");
        }
        
        // التحقق من عدم وجود العلاقة مسبقاً
        const { data: existingRelation, error: checkError } = await supabase
          .from('internal_message_label_relations')
          .select('id')
          .eq('message_id', messageId)
          .eq('label_id', labelId)
          .eq('user_id', user.data.user.id);
          
        if (checkError) throw checkError;
        
        if (existingRelation && existingRelation.length > 0) {
          return { success: true, alreadyExists: true };
        }
        
        // إضافة علاقة جديدة
        const { error } = await supabase
          .from('internal_message_label_relations')
          .insert({
            message_id: messageId,
            label_id: labelId,
            user_id: user.data.user.id
          });
          
        if (error) throw error;
        
        return { success: true };
      } catch (error: any) {
        console.error("Error adding label to message:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mail-message', variables.messageId] });
    },
  });

  // إزالة تصنيف من رسالة
  const removeLabelFromMessage = useMutation({
    mutationFn: async ({ messageId, labelId }: { messageId: string, labelId: string }) => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("يجب تسجيل الدخول لإزالة تصنيف من الرسائل");
        }
        
        const { error } = await supabase
          .from('internal_message_label_relations')
          .delete()
          .eq('message_id', messageId)
          .eq('label_id', labelId)
          .eq('user_id', user.data.user.id);
          
        if (error) throw error;
        
        return { success: true };
      } catch (error: any) {
        console.error("Error removing label from message:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mail-message', variables.messageId] });
    },
  });

  return {
    labels,
    isLoadingLabels,
    addLabel,
    deleteLabel,
    addLabelToMessage,
    removeLabelFromMessage,
  };
};
