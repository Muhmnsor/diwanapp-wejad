import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { AsanaProjectFormData, AsanaProjectDialogProps } from "@/types/asanaProject";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const CreateAsanaProjectDialog = ({
  open,
  onOpenChange,
  portfolioId,
  onSuccess
}: AsanaProjectDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<AsanaProjectFormData>({
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      status: "on_track",
      priority: "medium"
    }
  });

  const onSubmit = async (data: AsanaProjectFormData) => {
    setIsLoading(true);
    try {
      // Create project in Asana
      const { data: asanaResponse, error: asanaError } = await supabase.functions.invoke('create-asana-portfolio-project', {
        body: { 
          portfolioId,
          project: data
        }
      });

      if (asanaError) throw asanaError;

      // Create project in Supabase
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([{
          title: data.title,
          description: data.description,
          start_date: data.startDate,
          end_date: data.dueDate,
          event_type: 'portfolio',
          event_path: 'portfolio',
          event_category: 'portfolio',
          image_url: '/placeholder.svg', // Default image
          max_attendees: 0,
          beneficiary_type: 'both'
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      // Link project to portfolio
      const { error: linkError } = await supabase
        .from('portfolio_projects')
        .insert([{
          portfolio_id: portfolioId,
          project_id: projectData.id,
          asana_gid: asanaResponse.gid,
          asana_status: data.status,
          asana_priority: data.priority
        }]);

      if (linkError) throw linkError;

      toast.success("تم إنشاء المشروع بنجاح");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("حدث خطأ أثناء إنشاء المشروع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء مشروع جديد</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المشروع</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ البداية</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ النهاية</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="on_track">في المسار</SelectItem>
                        <SelectItem value="at_risk">في خطر</SelectItem>
                        <SelectItem value="off_track">خارج المسار</SelectItem>
                        <SelectItem value="on_hold">متوقف</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الأولوية</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="medium">متوسطة</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? "جاري الإنشاء..." : "إنشاء المشروع"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};