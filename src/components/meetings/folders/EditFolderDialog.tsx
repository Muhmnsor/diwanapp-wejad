
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Folder {
  id: string;
  name: string;
  description: string | null;
}

interface EditFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Folder;
  onSuccess?: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, "يجب أن يحتوي اسم التصنيف على حرفين على الأقل"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const EditFolderDialog = ({ open, onOpenChange, folder, onSuccess }: EditFolderDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: folder.name,
      description: folder.description || "",
    },
  });

  const { mutate: updateFolder, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data, error } = await supabase
        .from("meeting_folders")
        .update({
          name: values.name,
          description: values.description || null,
        })
        .eq("id", folder.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تم تحديث التصنيف بنجاح");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(`حدث خطأ أثناء تحديث التصنيف: ${error.message}`);
    },
  });

  const onSubmit = (values: FormValues) => {
    updateFolder(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تعديل التصنيف</DialogTitle>
          <DialogDescription>
            قم بتعديل معلومات تصنيف الاجتماعات
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم التصنيف</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم التصنيف" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="وصف التصنيف (اختياري)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري التحديث..." : "تحديث التصنيف"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
