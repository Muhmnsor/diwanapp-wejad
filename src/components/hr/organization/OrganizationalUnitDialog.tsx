
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(2, { message: "اسم الوحدة مطلوب" }),
  description: z.string().optional(),
  unit_type: z.string().min(1, { message: "نوع الوحدة مطلوب" }),
  parent_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

type OrganizationalUnitFormValues = z.infer<typeof formSchema>;

interface OrganizationalUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function OrganizationalUnitDialog({
  open,
  onOpenChange,
  onSuccess
}: OrganizationalUnitDialogProps) {
  const { data: units, isLoading } = useOrganizationalUnits();
  const { toast } = useToast();
  
  const form = useForm<OrganizationalUnitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      unit_type: "department",
      parent_id: "none",
      is_active: true,
    },
  });

  async function handleSubmit(values: OrganizationalUnitFormValues) {
    try {
      // Convert "none" to null for parent_id
      const parentId = values.parent_id === "none" ? null : values.parent_id;
      
      const { error } = await supabase
        .from('organizational_units')
        .insert({
          name: values.name,
          description: values.description || null,
          unit_type: values.unit_type,
          parent_id: parentId,
          is_active: values.is_active,
        });

      if (error) throw error;
      
      toast({
        title: "تم إضافة الوحدة التنظيمية",
        description: "تمت إضافة الوحدة التنظيمية بنجاح",
      });
      
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding organizational unit:", error);
      toast({
        title: "حدث خطأ",
        description: "حدث خطأ أثناء إضافة الوحدة التنظيمية",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة وحدة تنظيمية جديدة</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الوحدة</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم الوحدة التنظيمية" {...field} />
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
                      placeholder="وصف مختصر للوحدة التنظيمية (اختياري)" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unit_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الوحدة</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الوحدة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="department">إدارة</SelectItem>
                      <SelectItem value="division">قسم</SelectItem>
                      <SelectItem value="team">فريق</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوحدة الأم</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الوحدة الأم (اختياري)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">بدون وحدة أم</SelectItem>
                      {units?.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>الحالة</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">إضافة</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
